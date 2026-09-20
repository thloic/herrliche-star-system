"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, UserRound } from "lucide-react";
import type { Payment, Player } from "@/lib/types";
import type { DueStatus } from "@/lib/payments";
import { currentMonthStart } from "@/lib/payments";
import { PlayerRow } from "./PlayerRow";
import { DeletePlayerDialog } from "./DeletePlayerDialog";
import { PaymentStatusPanel } from "./PaymentStatusPanel";

export type PlayerWithPhoto = Player & {
  photoUrl: string | null;
  isPaidThisMonth: boolean;
  currentPayment: Payment | null;
  dueStatus: DueStatus | null;
};

type StatusFilter = "tous" | "payes" | "attente";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "payes", label: "Payés" },
  { value: "attente", label: "En attente" },
];

export function PlayerList({
  players,
  monthLabel,
  montantMensuel,
}: {
  players: PlayerWithPhoto[];
  monthLabel: string;
  montantMensuel: number;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tous");
  const [playerToDelete, setPlayerToDelete] = useState<PlayerWithPhoto | null>(
    null,
  );
  const [playerForPanel, setPlayerForPanel] = useState<PlayerWithPhoto | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter((player) => {
      const matchesQuery = !q || player.nom_prenom.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "tous" ||
        (statusFilter === "payes" && player.isPaidThisMonth) ||
        (statusFilter === "attente" && !player.isPaidThisMonth);
      return matchesQuery && matchesStatus;
    });
  }, [players, query, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium capitalize text-gray-500 dark:text-gray-400">
        Paiements de {monthLabel}
      </p>

      <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600">
        <Search size={18} className="text-gray-400 dark:text-gray-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un enfant…"
          aria-label="Rechercher un enfant"
          className="w-full bg-transparent text-base text-gray-900 outline-none dark:text-gray-100"
        />
      </div>

      <div role="tablist" aria-label="Filtrer par statut" className="flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={statusFilter === filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <UserRound size={40} className="text-gray-300 dark:text-gray-600" aria-hidden />
          <p className="text-gray-500 dark:text-gray-400">
            Aucun enfant inscrit pour l&apos;instant.
          </p>
          <Link
            href="/joueurs/nouveau"
            className="text-sm font-medium text-brand hover:underline dark:text-brand-light"
          >
            Inscrire le premier enfant
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {query
            ? `Aucun résultat pour « ${query} ».`
            : "Aucun enfant dans ce filtre."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((player) => (
            <li key={player.id}>
              <PlayerRow
                player={player}
                onDeleteRequest={() => setPlayerToDelete(player)}
                onStatusClick={() => setPlayerForPanel(player)}
              />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/joueurs/nouveau"
        aria-label="Inscrire un enfant"
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-transform duration-200 hover:scale-110 hover:bg-accent-dark active:scale-95"
      >
        <Plus size={24} aria-hidden />
      </Link>

      {playerToDelete && (
        <DeletePlayerDialog
          playerId={playerToDelete.id}
          playerName={playerToDelete.nom_prenom}
          onClose={() => setPlayerToDelete(null)}
        />
      )}

      {playerForPanel && (
        <PaymentStatusPanel
          playerId={playerForPanel.id}
          playerName={playerForPanel.nom_prenom}
          currentMonthISO={currentMonthStart()}
          currentPayment={playerForPanel.currentPayment}
          dueStatus={playerForPanel.dueStatus}
          montantMensuel={montantMensuel}
          onClose={() => setPlayerForPanel(null)}
        />
      )}
    </div>
  );
}
