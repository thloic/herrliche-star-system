import Link from "next/link";
import { UserRound } from "lucide-react";
import { formatDate } from "@/lib/payments";
import { StatusTag } from "./StatusTag";
import { RowMenu } from "./RowMenu";
import type { PlayerWithPhoto } from "./PlayerList";

export function PlayerRow({
  player,
  onDeleteRequest,
  onStatusClick,
}: {
  player: PlayerWithPhoto;
  onDeleteRequest: () => void;
  onStatusClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 transition-colors hover:border-brand/40 hover:bg-brand/5 dark:border-gray-700 dark:hover:bg-brand/10">
      <Link
        href={`/joueurs/${player.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {player.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL signée éphémère, pas d'intérêt à optimiser via next/image
          <img
            src={player.photoUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            <UserRound size={24} aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <p className="font-medium">{player.nom_prenom}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Né(e) le {formatDate(player.date_naissance)}
          </p>
        </div>
      </Link>
      <StatusTag isPaid={player.isPaidThisMonth} onClick={onStatusClick} />
      <RowMenu playerId={player.id} onDelete={onDeleteRequest} />
    </div>
  );
}
