import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/players";
import type { Player } from "@/lib/types";
import { BackLink } from "../../BackLink";
import { PlayerForm } from "../../PlayerForm";
import { updatePlayer } from "../../actions";

export default async function ModifierJoueurPage(
  props: PageProps<"/joueurs/[id]/modifier">,
) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const player = data as Player;
  const photoUrls = await getSignedPhotoUrls(supabase, [player.photo_path]);
  const currentPhotoUrl = player.photo_path
    ? (photoUrls[player.photo_path] ?? null)
    : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-sm">
        <BackLink href={`/joueurs/${id}`} label="Retour à la fiche" />
      </div>
      <h1 className="text-xl font-bold">Modifier la fiche</h1>
      <PlayerForm
        mode="edit"
        action={updatePlayer.bind(null, id)}
        defaultValues={player}
        currentPhotoUrl={currentPhotoUrl}
      />
    </div>
  );
}
