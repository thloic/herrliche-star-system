import { UserRound } from "lucide-react";
import type { Player } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-base">{value}</dd>
    </div>
  );
}

export function PlayerDetails({
  player,
  photoUrl,
}: {
  player: Player;
  photoUrl: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL signée éphémère, pas d'intérêt à optimiser via next/image
        <img
          src={photoUrl}
          alt={player.nom_prenom}
          className="h-32 w-32 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <UserRound size={48} aria-hidden />
        </span>
      )}

      <h1 className="text-xl font-bold">{player.nom_prenom}</h1>

      <dl className="grid w-full max-w-sm grid-cols-1 gap-3">
        <Info
          label="Date de naissance"
          value={formatDate(player.date_naissance)}
        />
        <Info label="Lieu de naissance" value={player.lieu_naissance} />
        <Info label="Téléphone" value={player.telephone || "—"} />
        <Info label="Résidence" value={player.adresse || "—"} />
        <Info label="Parent ou tuteur" value={player.parent_nom} />
        <Info
          label="Téléphone du parent"
          value={player.parent_telephone}
        />
      </dl>
    </div>
  );
}
