"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, UserRound } from "lucide-react";
import type { Player } from "@/lib/types";

export type PlayerWithPhoto = Player & { photoUrl: string | null };

export function PlayerList({ players }: { players: PlayerWithPhoto[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((player) =>
      player.nom_prenom.toLowerCase().includes(q),
    );
  }, [players, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
        <Search size={18} className="text-gray-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un enfant…"
          aria-label="Rechercher un enfant"
          className="w-full text-base outline-none"
        />
      </div>

      {players.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <UserRound size={40} className="text-gray-300" aria-hidden />
          <p className="text-gray-500">Aucun enfant inscrit pour l&apos;instant.</p>
          <Link
            href="/joueurs/nouveau"
            className="text-sm font-medium text-brand hover:underline"
          >
            Inscrire le premier enfant
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">
          Aucun résultat pour « {query} ».
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((player) => (
            <li key={player.id}>
              <Link
                href={`/joueurs/${player.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 transition-colors hover:border-brand/40 hover:bg-brand/5"
              >
                {player.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL signée éphémère, pas d'intérêt à optimiser via next/image
                  <img
                    src={player.photoUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <UserRound size={24} aria-hidden />
                  </span>
                )}
                <div>
                  <p className="font-medium">{player.nom_prenom}</p>
                  <p className="text-sm text-gray-500">
                    {player.lieu_naissance}
                  </p>
                </div>
              </Link>
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
    </div>
  );
}
