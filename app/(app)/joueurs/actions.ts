"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deletePlayerPhoto, uploadPlayerPhoto } from "@/lib/players";
import {
  validatePlayerInput,
  type PlayerFormErrors,
  type PlayerFormInput,
} from "./validation";

export type PlayerFormState =
  | { errors: PlayerFormErrors; message?: string }
  | { errors?: undefined; message: string }
  | undefined;

function readInput(formData: FormData): PlayerFormInput {
  return {
    nom_prenom: String(formData.get("nom_prenom") ?? ""),
    date_naissance: String(formData.get("date_naissance") ?? ""),
    telephone: String(formData.get("telephone") ?? ""),
    adresse: String(formData.get("adresse") ?? ""),
    parent_nom: String(formData.get("parent_nom") ?? ""),
    parent_telephone: String(formData.get("parent_telephone") ?? ""),
  };
}

function hasPhoto(formData: FormData): boolean {
  const photo = formData.get("photo");
  return photo instanceof File && photo.size > 0;
}

export async function createPlayer(
  _prevState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const input = readInput(formData);
  const errors = validatePlayerInput(input);

  // La photo est obligatoire à l'inscription (pas en modification : le
  // joueur en a déjà une).
  if (!hasPhoto(formData)) {
    errors.photo = "La photo de l'enfant est requise.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const id = crypto.randomUUID();

  const photo = formData.get("photo") as File;
  const uploadResult = await uploadPlayerPhoto(supabase, id, photo);
  if (uploadResult.error) {
    return { message: uploadResult.error };
  }

  const { error: insertError } = await supabase.from("players").insert({
    id,
    photo_path: uploadResult.path,
    nom_prenom: input.nom_prenom.trim(),
    date_naissance: input.date_naissance,
    telephone: input.telephone.trim() || null,
    adresse: input.adresse.trim() || null,
    parent_nom: input.parent_nom.trim(),
    parent_telephone: input.parent_telephone.trim(),
  });

  if (insertError) {
    return { message: "Erreur lors de l'enregistrement du joueur." };
  }

  revalidatePath("/joueurs");
  redirect(`/joueurs/${id}?bienvenue=1`);
}

export async function updatePlayer(
  playerId: string,
  _prevState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const input = readInput(formData);
  const errors = validatePlayerInput(input);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();

  const update: {
    nom_prenom: string;
    date_naissance: string;
    telephone: string | null;
    adresse: string | null;
    parent_nom: string;
    parent_telephone: string;
    photo_path?: string;
  } = {
    nom_prenom: input.nom_prenom.trim(),
    date_naissance: input.date_naissance,
    telephone: input.telephone.trim() || null,
    adresse: input.adresse.trim() || null,
    parent_nom: input.parent_nom.trim(),
    parent_telephone: input.parent_telephone.trim(),
  };

  if (hasPhoto(formData)) {
    const result = await uploadPlayerPhoto(
      supabase,
      playerId,
      formData.get("photo") as File,
    );
    if (result.error) {
      return { message: result.error };
    }
    if (result.path) update.photo_path = result.path;
  }

  const { error: updateError } = await supabase
    .from("players")
    .update(update)
    .eq("id", playerId);

  if (updateError) {
    return { message: "Erreur lors de la mise à jour du joueur." };
  }

  revalidatePath("/joueurs");
  revalidatePath(`/joueurs/${playerId}`);
  redirect(`/joueurs/${playerId}?modifie=1`);
}

export async function deletePlayer(
  playerId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("photo_path")
    .eq("id", playerId)
    .maybeSingle();

  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId);

  if (error) {
    return { error: "Erreur lors de la suppression." };
  }

  if (player?.photo_path) {
    await deletePlayerPhoto(supabase, player.photo_path);
  }

  revalidatePath("/joueurs");
  revalidatePath("/dashboard");
  return {};
}
