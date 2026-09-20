"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { error?: string; success?: boolean } | undefined;

export async function updateSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const montant = Number(formData.get("montant_mensuel"));

  if (!Number.isFinite(montant) || montant <= 0) {
    return { error: "Le montant doit être un nombre positif." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ montant_mensuel: montant })
    .eq("id", 1);

  if (error) {
    return { error: "Erreur lors de l'enregistrement." };
  }

  revalidatePath("/parametres");
  revalidatePath("/dashboard");
  return { success: true };
}
