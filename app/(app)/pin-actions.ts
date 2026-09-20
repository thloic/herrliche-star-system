"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DEVICE_ID_COOKIE,
  MAX_FAILED_ATTEMPTS,
  UNLOCK_COOKIE,
  UNLOCK_COOKIE_MAX_AGE_SECONDS,
  computeLockoutUntil,
  hashPin,
  isLockedOut,
  isValidPinFormat,
  remainingLockoutSeconds,
  verifyPinHash,
} from "@/lib/pin";
import type { PinLock } from "@/lib/types";

async function requireDeviceId(): Promise<string> {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get(DEVICE_ID_COOKIE)?.value;
  if (!deviceId) {
    throw new Error("Identifiant d'appareil manquant — recharge la page.");
  }
  return deviceId;
}

async function setUnlockedCookie() {
  const cookieStore = await cookies();
  cookieStore.set(UNLOCK_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_COOKIE_MAX_AGE_SECONDS,
  });
}

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

async function getPinLock(
  userId: string,
  deviceId: string,
): Promise<PinLock | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pin_locks")
    .select("*")
    .eq("user_id", userId)
    .eq("device_id", deviceId)
    .maybeSingle();
  return data as PinLock | null;
}

function lockoutMessage(lockedUntil: string): string {
  return `Trop d'essais. Réessaie dans ${remainingLockoutSeconds(lockedUntil)}s.`;
}

export type PinFormState = { error?: string; success?: boolean } | undefined;

export async function enablePin(
  _prevState: PinFormState,
  formData: FormData,
): Promise<PinFormState> {
  const pin = String(formData.get("pin") ?? "");
  const pinConfirm = String(formData.get("pin_confirm") ?? "");

  if (!isValidPinFormat(pin)) {
    return { error: "Le code doit contenir exactement 6 chiffres." };
  }
  if (pin !== pinConfirm) {
    return { error: "Les deux codes ne correspondent pas." };
  }

  const userId = await getCurrentUserId();
  const deviceId = await requireDeviceId();
  const supabase = await createClient();

  const { error } = await supabase.from("pin_locks").upsert(
    {
      user_id: userId,
      device_id: deviceId,
      pin_hash: hashPin(pin),
      failed_attempts: 0,
      locked_until: null,
    },
    { onConflict: "user_id,device_id" },
  );

  if (error) {
    return { error: "Erreur lors de l'activation du code PIN." };
  }

  await setUnlockedCookie();
  revalidatePath("/parametres");
  return { success: true };
}

export async function changePin(
  _prevState: PinFormState,
  formData: FormData,
): Promise<PinFormState> {
  const currentPin = String(formData.get("current_pin") ?? "");
  const newPin = String(formData.get("new_pin") ?? "");
  const newPinConfirm = String(formData.get("new_pin_confirm") ?? "");

  if (!isValidPinFormat(newPin)) {
    return { error: "Le nouveau code doit contenir exactement 6 chiffres." };
  }
  if (newPin !== newPinConfirm) {
    return { error: "Les deux codes ne correspondent pas." };
  }

  const userId = await getCurrentUserId();
  const deviceId = await requireDeviceId();
  const pinLock = await getPinLock(userId, deviceId);

  if (!pinLock) {
    return { error: "Aucun code PIN actif sur cet appareil." };
  }
  if (isLockedOut(pinLock.locked_until)) {
    return { error: lockoutMessage(pinLock.locked_until!) };
  }
  if (!verifyPinHash(currentPin, pinLock.pin_hash)) {
    return { error: "Code actuel incorrect." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pin_locks")
    .update({
      pin_hash: hashPin(newPin),
      failed_attempts: 0,
      locked_until: null,
    })
    .eq("id", pinLock.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour du code PIN." };
  }

  revalidatePath("/parametres");
  return { success: true };
}

export async function disablePin(
  _prevState: PinFormState,
  formData: FormData,
): Promise<PinFormState> {
  const currentPin = String(formData.get("current_pin") ?? "");

  const userId = await getCurrentUserId();
  const deviceId = await requireDeviceId();
  const pinLock = await getPinLock(userId, deviceId);

  if (!pinLock) {
    return { success: true };
  }
  if (isLockedOut(pinLock.locked_until)) {
    return { error: lockoutMessage(pinLock.locked_until!) };
  }
  if (!verifyPinHash(currentPin, pinLock.pin_hash)) {
    return { error: "Code actuel incorrect." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pin_locks")
    .delete()
    .eq("id", pinLock.id);

  if (error) {
    return { error: "Erreur lors de la désactivation du code PIN." };
  }

  revalidatePath("/parametres");
  return { success: true };
}

export async function lockNow() {
  const cookieStore = await cookies();
  cookieStore.delete(UNLOCK_COOKIE);
  redirect("/dashboard");
}

export type VerifyPinState = { error?: string } | undefined;

export async function verifyPinAttempt(
  _prevState: VerifyPinState,
  formData: FormData,
): Promise<VerifyPinState> {
  const pin = String(formData.get("pin") ?? "");

  const userId = await getCurrentUserId();
  const deviceId = await requireDeviceId();
  const pinLock = await getPinLock(userId, deviceId);

  if (!pinLock) {
    // Pas (ou plus) de PIN configuré sur cet appareil : rien à vérifier.
    await setUnlockedCookie();
    return undefined;
  }

  if (isLockedOut(pinLock.locked_until)) {
    return { error: lockoutMessage(pinLock.locked_until!) };
  }

  const supabase = await createClient();

  if (!verifyPinHash(pin, pinLock.pin_hash)) {
    const failedAttempts = pinLock.failed_attempts + 1;
    const lockedOut = failedAttempts >= MAX_FAILED_ATTEMPTS;
    const lockedUntil = lockedOut ? computeLockoutUntil() : null;

    await supabase
      .from("pin_locks")
      .update({
        failed_attempts: lockedOut ? 0 : failedAttempts,
        locked_until: lockedUntil,
      })
      .eq("id", pinLock.id);

    if (lockedOut && lockedUntil) {
      return { error: lockoutMessage(lockedUntil) };
    }
    const remaining = MAX_FAILED_ATTEMPTS - failedAttempts;
    return {
      error: `Code incorrect. ${remaining} essai${remaining > 1 ? "s" : ""} restant${remaining > 1 ? "s" : ""}.`,
    };
  }

  await supabase
    .from("pin_locks")
    .update({ failed_attempts: 0, locked_until: null })
    .eq("id", pinLock.id);

  // Ne pas rediriger : la mutation de cookie ci-dessous suffit à faire
  // rejouer le rendu de la route déjà demandée (voir doc Server Actions).
  await setUnlockedCookie();
  return undefined;
}

export async function forgotPin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const cookieStore = await cookies();
    const deviceId = cookieStore.get(DEVICE_ID_COOKIE)?.value;
    if (deviceId) {
      await supabase
        .from("pin_locks")
        .delete()
        .eq("user_id", user.id)
        .eq("device_id", deviceId);
    }
  }

  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete(UNLOCK_COOKIE);
  redirect("/login");
}
