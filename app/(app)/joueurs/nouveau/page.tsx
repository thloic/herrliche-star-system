import { BackLink } from "../BackLink";
import { PlayerForm } from "../PlayerForm";
import { createPlayer } from "../actions";

export default function NouveauJoueurPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-sm">
        <BackLink />
      </div>
      <h1 className="text-xl font-bold">Inscrire un enfant</h1>
      <PlayerForm mode="create" action={createPlayer} />
    </div>
  );
}
