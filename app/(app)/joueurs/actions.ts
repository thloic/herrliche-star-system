"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadPlayerPhoto } from "@/lib/players";
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
    lieu_naissance: String(formData.get("lieu_naissance") ?? ""),
    telephone: String(formData.get("telephone") ?? ""),
    adresse: String(formData.get("adresse") ?? ""),
    parent_nom: String(formData.get("parent_nom") ?? ""),
    parent_telephone: String(formData.get("parent_telephone") ?? ""),
  };
}

export async function createPlayer(
  _prevState: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  const input = readInput(formData);
  const errors = validatePlayerInput(input);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const id = crypto.randomUUID();

  let photo_path: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const result = await uploadPlayerPhoto(supabase, id, photo);
    if (result.error) {
      return { message: result.error };
    }
    photo_path = result.path;
  }

  const { error: insertError } = await supabase.from("players").insert({
    id,
    photo_path,
    nom_prenom: input.nom_prenom.trim(),
    date_naissance: input.date_naissance,
    lieu_naissance: input.lieu_naissance.trim(),
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
