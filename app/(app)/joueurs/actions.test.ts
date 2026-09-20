import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  insert,
  update,
  updateEq,
  del,
  deleteEq,
  selectEq,
  maybeSingle,
  from,
  redirect,
  revalidatePath,
  uploadPlayerPhoto,
  deletePlayerPhoto,
} = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
  updateEq: vi.fn(),
  del: vi.fn(),
  deleteEq: vi.fn(),
  selectEq: vi.fn(),
  maybeSingle: vi.fn(),
  from: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
  uploadPlayerPhoto: vi.fn(),
  deletePlayerPhoto: vi.fn(),
}));

update.mockImplementation(() => ({ eq: updateEq }));
del.mockImplementation(() => ({ eq: deleteEq }));
selectEq.mockImplementation(() => ({ maybeSingle }));
from.mockImplementation(() => ({
  insert,
  update,
  delete: del,
  select: () => ({ eq: selectEq }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

vi.mock("@/lib/players", () => ({ uploadPlayerPhoto, deletePlayerPhoto }));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirect(path),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePath(path),
}));

import { createPlayer, deletePlayer, updatePlayer } from "./actions";

function formData(fields: Record<string, string | File>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const validFields = {
  nom_prenom: "AGBETOKA Kodjo Kevin",
  date_naissance: "2014-05-12",
  telephone: "90875243",
  adresse: "Amadahome",
  parent_nom: "AGBETOKA Kossi",
  parent_telephone: "90875244",
};

function samplePhoto() {
  return new File(["data"], "photo.jpg", { type: "image/jpeg" });
}

describe("createPlayer", () => {
  beforeEach(() => {
    insert.mockReset().mockResolvedValue({ error: null });
    from.mockClear();
    redirect.mockReset();
    revalidatePath.mockReset();
    uploadPlayerPhoto.mockReset();
    deletePlayerPhoto.mockReset();
    updateEq.mockReset().mockResolvedValue({ error: null });
    deleteEq.mockReset().mockResolvedValue({ error: null });
    maybeSingle.mockReset().mockResolvedValue({ data: null });
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

  it("refuse la création sans photo", async () => {
    const result = await createPlayer(undefined, formData(validFields));

    expect(result?.errors?.photo).toBeDefined();
    expect(from).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("téléverse la photo et enregistre son chemin puis redirige vers la fiche", async () => {
    uploadPlayerPhoto.mockResolvedValue({ path: "abc.jpg", error: null });
    const photo = samplePhoto();

    await createPlayer(undefined, formData({ ...validFields, photo }));

    expect(uploadPlayerPhoto).toHaveBeenCalledWith(
      expect.anything(),
      "00000000-0000-0000-0000-000000000000",
      photo,
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "00000000-0000-0000-0000-000000000000",
        photo_path: "abc.jpg",
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

  it("arrête tout si l'envoi de la photo échoue", async () => {
    uploadPlayerPhoto.mockResolvedValue({
      path: null,
      error: "Erreur lors de l'envoi de la photo.",
    });

    const result = await createPlayer(
      undefined,
      formData({ ...validFields, photo: samplePhoto() }),
    );

    expect(result?.message).toBe("Erreur lors de l'envoi de la photo.");
    expect(insert).not.toHaveBeenCalled();
  });

  it("renvoie un message d'erreur si l'insertion échoue", async () => {
    uploadPlayerPhoto.mockResolvedValue({ path: "abc.jpg", error: null });
    insert.mockResolvedValue({ error: { message: "boom" } });

    const result = await createPlayer(
      undefined,
      formData({ ...validFields, photo: samplePhoto() }),
    );

    expect(result?.message).toBe("Erreur lors de l'enregistrement du joueur.");
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("updatePlayer", () => {
  beforeEach(() => {
    update.mockClear();
    updateEq.mockReset().mockResolvedValue({ error: null });
    redirect.mockReset();
    revalidatePath.mockReset();
    uploadPlayerPhoto.mockReset();
  });

  it("renvoie les erreurs de validation sans appeler Supabase", async () => {
    const result = await updatePlayer(
      "player-1",
      undefined,
      formData({ ...validFields, nom_prenom: "" }),
    );

    expect(result?.errors?.nom_prenom).toBeDefined();
    expect(update).not.toHaveBeenCalled();
  });

  it("met à jour le joueur sans toucher à la photo si aucune n'est fournie", async () => {
    await updatePlayer("player-1", undefined, formData(validFields));

    expect(uploadPlayerPhoto).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ nom_prenom: "AGBETOKA Kodjo Kevin" }),
    );
    expect(update).toHaveBeenCalledWith(
      expect.not.objectContaining({ photo_path: expect.anything() }),
    );
    expect(updateEq).toHaveBeenCalledWith("id", "player-1");
    expect(revalidatePath).toHaveBeenCalledWith("/joueurs");
    expect(revalidatePath).toHaveBeenCalledWith("/joueurs/player-1");
    expect(redirect).toHaveBeenCalledWith("/joueurs/player-1?modifie=1");
  });

  it("remplace la photo si une nouvelle est fournie", async () => {
    uploadPlayerPhoto.mockResolvedValue({ path: "player-1.png", error: null });
    const photo = new File(["data"], "photo.png", { type: "image/png" });

    await updatePlayer("player-1", undefined, formData({ ...validFields, photo }));

    expect(uploadPlayerPhoto).toHaveBeenCalledWith(
      expect.anything(),
      "player-1",
      photo,
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ photo_path: "player-1.png" }),
    );
  });

  it("renvoie une erreur si la mise à jour échoue", async () => {
    updateEq.mockResolvedValue({ error: { message: "boom" } });

    const result = await updatePlayer("player-1", undefined, formData(validFields));

    expect(result?.message).toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("deletePlayer", () => {
  beforeEach(() => {
    del.mockClear();
    deleteEq.mockReset().mockResolvedValue({ error: null });
    maybeSingle.mockReset().mockResolvedValue({ data: null });
    deletePlayerPhoto.mockReset();
    revalidatePath.mockReset();
  });

  it("supprime le joueur et revalide la liste et le dashboard", async () => {
    const result = await deletePlayer("player-1");

    expect(deleteEq).toHaveBeenCalledWith("id", "player-1");
    expect(revalidatePath).toHaveBeenCalledWith("/joueurs");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(result.error).toBeUndefined();
  });

  it("supprime aussi la photo associée si elle existe", async () => {
    maybeSingle.mockResolvedValue({ data: { photo_path: "player-1.jpg" } });

    await deletePlayer("player-1");

    expect(deletePlayerPhoto).toHaveBeenCalledWith(
      expect.anything(),
      "player-1.jpg",
    );
  });

  it("ne tente pas de supprimer de photo si le joueur n'en avait pas", async () => {
    maybeSingle.mockResolvedValue({ data: { photo_path: null } });

    await deletePlayer("player-1");

    expect(deletePlayerPhoto).not.toHaveBeenCalled();
  });

  it("renvoie une erreur si la suppression échoue", async () => {
    deleteEq.mockResolvedValue({ error: { message: "boom" } });

    const result = await deletePlayer("player-1");

    expect(result.error).toBeDefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
