import { describe, expect, it, vi, beforeEach } from "vitest";
import { hashPin, verifyPinHash } from "@/lib/pin";
import type { PinLock } from "@/lib/types";

const {
  cookieGet,
  cookieSet,
  cookieDelete,
  getUser,
  signOut,
  from,
  redirect,
  revalidatePath,
  resultQueue,
  calls,
} = vi.hoisted(() => {
  const resultQueue: { data?: unknown; error?: unknown }[] = [];
  const calls: { method: string; args: unknown[] }[] = [];

  function makeBuilder() {
    const result = resultQueue.shift() ?? { data: null, error: null };
    const builder: {
      select: ReturnType<typeof vi.fn>;
      eq: ReturnType<typeof vi.fn>;
      maybeSingle: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      then: (resolve: (value: unknown) => unknown) => Promise<unknown>;
    } = {
      select: vi.fn((...args) => {
        calls.push({ method: "select", args });
        return builder;
      }),
      eq: vi.fn((...args) => {
        calls.push({ method: "eq", args });
        return builder;
      }),
      maybeSingle: vi.fn(() => Promise.resolve(result)),
      upsert: vi.fn((...args) => {
        calls.push({ method: "upsert", args });
        return Promise.resolve(result);
      }),
      update: vi.fn((...args) => {
        calls.push({ method: "update", args });
        return builder;
      }),
      delete: vi.fn((...args) => {
        calls.push({ method: "delete", args });
        return builder;
      }),
      then: (resolve) => Promise.resolve(result).then(resolve),
    };
    return builder;
  }

  return {
    cookieGet: vi.fn(),
    cookieSet: vi.fn(),
    cookieDelete: vi.fn(),
    getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
    signOut: vi.fn(async () => ({ error: null })),
    from: vi.fn(() => makeBuilder()),
    redirect: vi.fn(),
    revalidatePath: vi.fn(),
    resultQueue,
    calls,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser, signOut },
    from,
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: cookieGet,
    set: cookieSet,
    delete: cookieDelete,
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirect(path),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePath(path),
}));

import {
  changePin,
  disablePin,
  enablePin,
  forgotPin,
  lockNow,
  verifyPinAttempt,
} from "./pin-actions";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

function pinLock(overrides: Partial<PinLock> = {}): PinLock {
  return {
    id: "lock-1",
    user_id: "user-1",
    device_id: "device-1",
    pin_hash: hashPin("123456"),
    failed_attempts: 0,
    locked_until: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  resultQueue.length = 0;
  calls.length = 0;
  cookieGet.mockReset().mockReturnValue({ value: "device-1" });
  cookieSet.mockReset();
  cookieDelete.mockReset();
  getUser.mockReset().mockResolvedValue({ data: { user: { id: "user-1" } } });
  signOut.mockReset().mockResolvedValue({ error: null });
  from.mockClear();
  redirect.mockReset();
  revalidatePath.mockReset();
});

describe("enablePin", () => {
  it("refuse un format invalide", async () => {
    const result = await enablePin(undefined, formData({ pin: "12", pin_confirm: "12" }));
    expect(result?.error).toBeDefined();
    expect(from).not.toHaveBeenCalled();
  });

  it("refuse si les deux codes ne correspondent pas", async () => {
    const result = await enablePin(
      undefined,
      formData({ pin: "123456", pin_confirm: "654321" }),
    );
    expect(result?.error).toBeDefined();
  });

  it("active le PIN, hashe le code et débloque l'appareil", async () => {
    resultQueue.push({ error: null });

    const result = await enablePin(
      undefined,
      formData({ pin: "123456", pin_confirm: "123456" }),
    );

    const upsertCall = calls.find((c) => c.method === "upsert");
    expect(upsertCall).toBeDefined();
    const payload = upsertCall!.args[0] as { pin_hash: string; user_id: string };
    expect(verifyPinHash("123456", payload.pin_hash)).toBe(true);
    expect(payload.user_id).toBe("user-1");
    expect(cookieSet).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/parametres");
    expect(result?.success).toBe(true);
  });
});

describe("changePin", () => {
  it("refuse s'il n'y a pas de PIN actif", async () => {
    resultQueue.push({ data: null });
    const result = await changePin(
      undefined,
      formData({ current_pin: "123456", new_pin: "111111", new_pin_confirm: "111111" }),
    );
    expect(result?.error).toBeDefined();
  });

  it("refuse si verrouillé", async () => {
    resultQueue.push({
      data: pinLock({ locked_until: new Date(Date.now() + 60_000).toISOString() }),
    });
    const result = await changePin(
      undefined,
      formData({ current_pin: "123456", new_pin: "111111", new_pin_confirm: "111111" }),
    );
    expect(result?.error).toMatch(/Trop d'essais/);
  });

  it("refuse si le code actuel est incorrect", async () => {
    resultQueue.push({ data: pinLock() });
    const result = await changePin(
      undefined,
      formData({ current_pin: "000000", new_pin: "111111", new_pin_confirm: "111111" }),
    );
    expect(result?.error).toBe("Code actuel incorrect.");
  });

  it("met à jour le hash avec le nouveau code", async () => {
    resultQueue.push({ data: pinLock() }, { error: null });

    const result = await changePin(
      undefined,
      formData({ current_pin: "123456", new_pin: "111111", new_pin_confirm: "111111" }),
    );

    const updateCall = calls.find((c) => c.method === "update");
    const payload = updateCall!.args[0] as { pin_hash: string };
    expect(verifyPinHash("111111", payload.pin_hash)).toBe(true);
    expect(result?.success).toBe(true);
  });
});

describe("disablePin", () => {
  it("réussit silencieusement s'il n'y a rien à désactiver", async () => {
    resultQueue.push({ data: null });
    const result = await disablePin(undefined, formData({ current_pin: "123456" }));
    expect(result?.success).toBe(true);
  });

  it("refuse si le code actuel est incorrect", async () => {
    resultQueue.push({ data: pinLock() });
    const result = await disablePin(undefined, formData({ current_pin: "000000" }));
    expect(result?.error).toBe("Code actuel incorrect.");
  });

  it("supprime la ligne pin_locks si le code est correct", async () => {
    resultQueue.push({ data: pinLock() }, { error: null });
    const result = await disablePin(undefined, formData({ current_pin: "123456" }));

    expect(calls.some((c) => c.method === "delete")).toBe(true);
    expect(result?.success).toBe(true);
  });
});

describe("lockNow", () => {
  it("supprime le cookie de déverrouillage et redirige", async () => {
    await lockNow();
    expect(cookieDelete).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});

describe("verifyPinAttempt", () => {
  it("débloque directement s'il n'y a pas de PIN configuré", async () => {
    resultQueue.push({ data: null });
    const result = await verifyPinAttempt(undefined, formData({ pin: "123456" }));
    expect(result).toBeUndefined();
    expect(cookieSet).toHaveBeenCalled();
  });

  it("refuse si verrouillé, sans même vérifier le code", async () => {
    resultQueue.push({
      data: pinLock({ locked_until: new Date(Date.now() + 60_000).toISOString() }),
    });
    const result = await verifyPinAttempt(undefined, formData({ pin: "123456" }));
    expect(result?.error).toMatch(/Trop d'essais/);
  });

  it("incrémente les essais échoués et indique le nombre restant", async () => {
    resultQueue.push({ data: pinLock({ failed_attempts: 1 }) }, { error: null });

    const result = await verifyPinAttempt(undefined, formData({ pin: "000000" }));

    const updateCall = calls.find((c) => c.method === "update");
    expect(updateCall!.args[0]).toMatchObject({ failed_attempts: 2, locked_until: null });
    expect(result?.error).toBe("Code incorrect. 3 essais restants.");
  });

  it("verrouille l'appareil après le nombre maximal d'essais", async () => {
    resultQueue.push({ data: pinLock({ failed_attempts: 4 }) }, { error: null });

    const result = await verifyPinAttempt(undefined, formData({ pin: "000000" }));

    const updateCall = calls.find((c) => c.method === "update");
    expect(updateCall!.args[0]).toMatchObject({ failed_attempts: 0 });
    expect(
      (updateCall!.args[0] as { locked_until: string }).locked_until,
    ).not.toBeNull();
    expect(result?.error).toMatch(/Trop d'essais/);
  });

  it("débloque l'appareil et réinitialise les essais avec le bon code", async () => {
    resultQueue.push({ data: pinLock({ failed_attempts: 3 }) }, { error: null });

    const result = await verifyPinAttempt(undefined, formData({ pin: "123456" }));

    const updateCall = calls.find((c) => c.method === "update");
    expect(updateCall!.args[0]).toEqual({ failed_attempts: 0, locked_until: null });
    expect(cookieSet).toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});

describe("forgotPin", () => {
  it("supprime le PIN de l'appareil, déconnecte et redirige vers /login", async () => {
    resultQueue.push({ error: null });

    await forgotPin();

    expect(calls.some((c) => c.method === "delete")).toBe(true);
    expect(signOut).toHaveBeenCalled();
    expect(cookieDelete).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
