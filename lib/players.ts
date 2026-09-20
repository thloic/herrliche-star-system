import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "player-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

// Bucket privé (photos de mineurs) : on ne stocke jamais d'URL publique,
// on génère des URLs signées à la demande, côté serveur.
export async function getSignedPhotoUrls(
  supabase: SupabaseClient,
  paths: (string | null)[],
): Promise<Record<string, string>> {
  const uniquePaths = [...new Set(paths.filter((p): p is string => !!p))];
  if (uniquePaths.length === 0) return {};

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

export async function uploadPlayerPhoto(
  supabase: SupabaseClient,
  playerId: string,
  photo: File,
): Promise<{ path: string | null; error: string | null }> {
  const extension = photo.name.split(".").pop() || "jpg";
  const path = `${playerId}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, photo, { contentType: photo.type, upsert: true });

  if (error) {
    return { path: null, error: "Erreur lors de l'envoi de la photo." };
  }

  return { path, error: null };
}

export function initials(nomPrenom: string): string {
  return nomPrenom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
