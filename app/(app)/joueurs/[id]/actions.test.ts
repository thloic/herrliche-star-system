import { describe, expect, it, vi, beforeEach } from "vitest";

const { upsert, from, revalidatePath } = vi.hoisted(() => ({
  upsert: vi.fn(),
  from: vi.fn(),
  revalidatePath: vi.fn(),
}));

from.mockImplementation(() => ({ upsert }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePath(path),
}));

import { markPaid } from "./actions";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("markPaid", () => {
  beforeEach(() => {
    upsert.mockReset().mockResolvedValue({ error: null });
    from.mockClear();
    revalidatePath.mockReset();
  });

  it("refuse sans mois ni date", async () => {
    const result = await markPaid("player-1", undefined, formData({}));
    expect(result?.error).toBeDefined();
    expect(from).not.toHaveBeenCalled();
  });

  it("normalise un mois au format YYYY-MM vers le 1er du mois", async () => {
    await markPaid(
      "player-1",
      undefined,
      formData({ mois: "2026-09", date_paiement: "2026-09-05" }),
    );

    expect(upsert).toHaveBeenCalledWith(
      {
        player_id: "player-1",
        mois: "2026-09-01",
        date_paiement: "2026-09-05",
      },
      { onConflict: "player_id,mois" },
    );
  });

  it("revalide la fiche joueur, la liste et le dashboard après succès", async () => {
    const result = await markPaid(
      "player-1",
      undefined,
      formData({ mois: "2026-09-01", date_paiement: "2026-09-05" }),
    );

    expect(revalidatePath).toHaveBeenCalledWith("/joueurs/player-1");
    expect(revalidatePath).toHaveBeenCalledWith("/joueurs");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(result?.success).toBe(true);
  });

  it("renvoie une erreur si l'upsert échoue", async () => {
    upsert.mockResolvedValue({ error: { message: "boom" } });

    const result = await markPaid(
      "player-1",
      undefined,
      formData({ mois: "2026-09-01", date_paiement: "2026-09-05" }),
    );

    expect(result?.error).toBeDefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
