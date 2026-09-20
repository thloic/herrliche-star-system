import { describe, expect, it, vi, beforeEach } from "vitest";

const { insert, from, redirect, revalidatePath, uploadPlayerPhoto } =
  vi.hoisted(() => ({
    insert: vi.fn(),
    from: vi.fn(),
    redirect: vi.fn(),
    revalidatePath: vi.fn(),
    uploadPlayerPhoto: vi.fn(),
  }));

from.mockImplementation(() => ({ insert }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

vi.mock("@/lib/players", () => ({ uploadPlayerPhoto }));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirect(path),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePath(path),
}));

import { createPlayer } from "./actions";

function formData(fields: Record<string, string | File>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const validFields = {
  nom_prenom: "AGBETOKA Kodjo Kevin",
  date_naissance: "2014-05-12",
  lieu_naissance: "Lomé",
  telephone: "90875243",
  adresse: "Amadahome",
  parent_nom: "AGBETOKA Kossi",
  parent_telephone: "90875244",
};

describe("createPlayer", () => {
  beforeEach(() => {
    insert.mockReset().mockResolvedValue({ error: null });
    from.mockClear();
    redirect.mockReset();
    revalidatePath.mockReset();
    uploadPlayerPhoto.mockReset();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-0000-0000-000000000000",
    );
  });

  it("renvoie les erreurs de validation sans appeler Supabase", async () => {
    const result = await createPlayer(
      undefined,
      formData({ ...validFields, nom_prenom: "" }),
    );

    expect(result?.errors?.nom_prenom).toBeDefined();
    expect(from).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("enregistre le joueur sans photo puis redirige vers sa fiche", async () => {
    await createPlayer(undefined, formData(validFields));

    expect(uploadPlayerPhoto).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "00000000-0000-0000-0000-000000000000",
        photo_path: null,
        nom_prenom: "AGBETOKA Kodjo Kevin",
        telephone: "90875243",
        adresse: "Amadahome",
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/joueurs");
    expect(redirect).toHaveBeenCalledWith(
      "/joueurs/00000000-0000-0000-0000-000000000000?bienvenue=1",
    );
  });

  it("téléverse la photo si fournie et enregistre son chemin", async () => {
    uploadPlayerPhoto.mockResolvedValue({ path: "abc.jpg", error: null });
    const photo = new File(["data"], "photo.jpg", { type: "image/jpeg" });

    await createPlayer(undefined, formData({ ...validFields, photo }));

    expect(uploadPlayerPhoto).toHaveBeenCalledWith(
      expect.anything(),
      "00000000-0000-0000-0000-000000000000",
      photo,
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ photo_path: "abc.jpg" }),
    );
  });

  it("arrête tout si l'envoi de la photo échoue", async () => {
    uploadPlayerPhoto.mockResolvedValue({
      path: null,
      error: "Erreur lors de l'envoi de la photo.",
    });
    const photo = new File(["data"], "photo.jpg", { type: "image/jpeg" });

    const result = await createPlayer(
      undefined,
      formData({ ...validFields, photo }),
    );

    expect(result?.message).toBe("Erreur lors de l'envoi de la photo.");
    expect(insert).not.toHaveBeenCalled();
  });

  it("renvoie un message d'erreur si l'insertion échoue", async () => {
    insert.mockResolvedValue({ error: { message: "boom" } });

    const result = await createPlayer(undefined, formData(validFields));

    expect(result?.message).toBe("Erreur lors de l'enregistrement du joueur.");
    expect(redirect).not.toHaveBeenCalled();
  });
});
