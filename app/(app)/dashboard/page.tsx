import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { computeDashboardStats } from "@/lib/dashboard";
import { initials } from "@/lib/players";
import {
  currentMonthStart,
  formatAmount,
  formatMonthLabel,
} from "@/lib/payments";
import type { Payment, Player, Settings } from "@/lib/types";
import { AnimatedGrid } from "./AnimatedGrid";

export default async function DashboardPage() {
  const supabase = await createClient();
  const currentMonthISO = currentMonthStart();

  const [{ data: playersData }, { data: paymentsData }, { data: settingsData }] =
    await Promise.all([
      supabase
        .from("players")
        .select("*")
        .order("nom_prenom", { ascending: true }),
      supabase.from("payments").select("*").eq("mois", currentMonthISO),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  const players = (playersData ?? []) as Player[];
  const currentMonthPayments = (paymentsData ?? []) as Payment[];
  const settings = settingsData as Settings | null;
  const montantMensuel = settings?.montant_mensuel ?? 0;

  const stats = computeDashboardStats(
    players,
    currentMonthPayments,
    montantMensuel,
  );

  return (
    <div className="-mx-4 -mt-4 flex flex-col gap-6">
      <div className="relative overflow-hidden bg-brand px-6 pb-10 pt-6 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full border-2 border-white/15"
        />
        <p className="relative z-10 text-sm capitalize text-white/70">
          {formatMonthLabel(currentMonthISO)}
        </p>
        <h1 className="relative z-10 mt-1 text-2xl font-extrabold">
          Bonjour, Coach
        </h1>
      </div>

      <div className="-mt-8 px-4">
        <AnimatedGrid className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-2xl font-bold text-brand">
              {stats.totalPlayers}
            </p>
            <p className="text-sm text-gray-500">Enfants inscrits</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-2xl font-bold text-accent">
              {stats.paidCount}
            </p>
            <p className="text-sm text-gray-500">Payés ce mois</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-2xl font-bold text-red-600">
              {stats.unpaidCount}
            </p>
            <p className="text-sm text-gray-500">En attente</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="font-mono text-lg font-bold">
              {formatAmount(stats.collected)}
            </p>
            <p className="text-sm text-gray-500">
              / {formatAmount(stats.expected)} attendu
            </p>
          </div>
        </AnimatedGrid>
      </div>

      <div className="px-4 pb-2">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          À relancer
        </h2>
        {stats.totalPlayers === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-gray-600">
              Aucun enfant inscrit pour l&apos;instant.
            </p>
            <Link
              href="/joueurs/nouveau"
              className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
            >
              Inscrire le premier enfant
            </Link>
          </div>
        ) : stats.unpaidPlayers.length === 0 ? (
          <p className="text-sm text-gray-500">
            Tout le monde est à jour ce mois-ci 🎉
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.unpaidPlayers.map((player) => (
              <li key={player.id}>
                <Link
                  href={`/joueurs/${player.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 transition-colors hover:border-brand/40 hover:bg-brand/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-brand">
                    {initials(player.nom_prenom)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{player.nom_prenom}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {player.parent_telephone}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    En attente
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
