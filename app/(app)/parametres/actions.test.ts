import { describe, expect, it, vi, beforeEach } from "vitest";

const { eq, update, from, revalidatePath } = vi.hoisted(() => ({
  eq: vi.fn(),
  update: vi.fn(),
  from: vi.fn(),
  revalidatePath: vi.fn(),
}));

update.mockImplementation(() => ({ eq }));
from.mockImplementation(() => ({ update }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePath(path),
}));

import { updateSettings } from "./actions";

function formData(montant: string) {
  const fd = new FormData();
  fd.set("montant_mensuel", montant);
  return fd;
}

describe("updateSettings", () => {
  beforeEach(() => {
    eq.mockReset().mockResolvedValue({ error: null });
    update.mockClear();
    from.mockClear();
    revalidatePath.mockReset();
  });

  it("refuse un montant vide ou non numérique", async () => {
    const result = await updateSettings(undefined, formData(""));
    expect(result?.error).toBeDefined();
    expect(from).not.toHaveBeenCalled();
  });

  it("refuse un montant négatif ou nul", async () => {
    const result = await updateSettings(undefined, formData("0"));
    expect(result?.error).toBeDefined();
    expect(from).not.toHaveBeenCalled();
  });

  it("met à jour le montant et revalide les pages concernées", async () => {
    const result = await updateSettings(undefined, formData("5000"));

    expect(update).toHaveBeenCalledWith({ montant_mensuel: 5000 });
    expect(eq).toHaveBeenCalledWith("id", 1);
    expect(revalidatePath).toHaveBeenCalledWith("/parametres");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(result?.success).toBe(true);
  });

  it("renvoie une erreur si la mise à jour échoue", async () => {
    eq.mockResolvedValue({ error: { message: "boom" } });

    const result = await updateSettings(undefined, formData("5000"));

    expect(result?.error).toBeDefined();
  });
});
