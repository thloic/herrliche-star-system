import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/players";
import type { Player } from "@/lib/types";
import { PlayerList, type PlayerWithPhoto } from "./PlayerList";

export default async function JoueursPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .order("nom_prenom", { ascending: true });

  const players = (data ?? []) as Player[];
  const photoUrls = await getSignedPhotoUrls(
    supabase,
    players.map((player) => player.photo_path),
  );

  const withPhotos: PlayerWithPhoto[] = players.map((player) => ({
    ...player,
    photoUrl: player.photo_path ? (photoUrls[player.photo_path] ?? null) : null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Joueurs</h1>
      <PlayerList players={withPhotos} />
    </div>
  );
}
