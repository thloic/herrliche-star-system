import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  computeDashboardStats,
  computeMonthlyCollections,
  computeMonthlyComparison,
} from "@/lib/dashboard";
import { initials } from "@/lib/players";
import {
  currentMonthStart,
  formatAmount,
  formatMonthLabel,
  lastNMonths,
} from "@/lib/payments";
import type { Payment, Player, Settings } from "@/lib/types";
import { StatusTag } from "../joueurs/StatusTag";
import { AnimatedGrid } from "./AnimatedGrid";
import { MonthlyChart } from "./MonthlyChart";
import { MonthlyComparisonChart } from "./MonthlyComparisonChart";
import { MonthSelector } from "./MonthSelector";

const CHART_MONTHS = 12;

const MONTH_PARAM_PATTERN = /^\d{4}-\d{2}-01$/;

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const months = lastNMonths(CHART_MONTHS);
  const currentMonthISO = currentMonthStart();
  const requestedMonth =
    typeof searchParams.mois === "string" ? searchParams.mois : undefined;
  // N'importe quel mois est accepté (pas seulement les 12 derniers) : le
  // coach doit pouvoir consulter un mois plus ancien via le sélecteur.
  const selectedMonth =
    requestedMonth && MONTH_PARAM_PATTERN.test(requestedMonth)
      ? requestedMonth
      : currentMonthISO;
  const isCurrentMonth = selectedMonth === currentMonthISO;

  const supabase = await createClient();

  const [
    { data: playersData },
    { data: selectedMonthData },
    { data: settingsData },
    { data: chartPaymentsData },
  ] = await Promise.all([
    supabase
      .from("players")
      .select("*")
      .order("nom_prenom", { ascending: true }),
    supabase.from("payments").select("*").eq("mois", selectedMonth),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("payments").select("*").gte("mois", months[0]),
  ]);

  const players = (playersData ?? []) as Player[];
  const selectedMonthPayments = (selectedMonthData ?? []) as Payment[];
  const chartPayments = (chartPaymentsData ?? []) as Payment[];
  const settings = settingsData as Settings | null;
  const montantMensuel = settings?.montant_mensuel ?? 0;

  const stats = computeDashboardStats(
    players,
    selectedMonthPayments,
    montantMensuel,
  );
  const monthlyCollections = computeMonthlyCollections(
    chartPayments,
    months,
    montantMensuel,
  );
  const monthlyComparison = computeMonthlyComparison(
    players,
    chartPayments,
    months,
  );

  return (
    <div className="-mx-4 -mt-4 flex flex-col gap-6">
      <div className="relative overflow-hidden bg-brand px-6 pb-10 pt-6 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full border-2 border-white/15"
        />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <p className="text-sm capitalize text-white/70">
            Résultats de {formatMonthLabel(selectedMonth)}
          </p>
          <MonthSelector selected={selectedMonth} />
        </div>
        <h1 className="relative z-10 mt-1 text-2xl font-extrabold">
          Bonjour, Coach
        </h1>
      </div>

      <div className="-mt-8 px-4">
        <AnimatedGrid className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="font-mono text-2xl font-bold text-brand dark:text-brand-light">
              {stats.totalPlayers}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enfants inscrits</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="font-mono text-2xl font-bold text-accent">
              {stats.paidCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Payés</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.unpaidCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatAmount(stats.collected)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              / {formatAmount(stats.expected)} attendu
            </p>
          </div>
        </AnimatedGrid>
      </div>

      <div className="flex flex-col gap-4 px-4">
        <MonthlyChart data={monthlyCollections} />
        <MonthlyComparisonChart data={monthlyComparison} />
      </div>

      <div className="px-4 pb-2">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {isCurrentMonth ? "À relancer" : "N'ont pas payé"}
        </h2>
        {stats.totalPlayers === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300">
              Aucun enfant inscrit pour l&apos;instant.
            </p>
            <Link
              href="/joueurs/nouveau"
              className="mt-2 inline-block text-sm font-medium text-brand hover:underline dark:text-brand-light"
            >
              Inscrire le premier enfant
            </Link>
          </div>
        ) : stats.unpaidPlayers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isCurrentMonth
              ? "Tout le monde est à jour ce mois-ci 🎉"
              : `Tout le monde avait payé en ${formatMonthLabel(selectedMonth)} 🎉`}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.unpaidPlayers.map((player) => (
              <li key={player.id}>
                <Link
                  href={`/joueurs/${player.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 transition-colors hover:border-brand/40 hover:bg-brand/5 dark:border-gray-700 dark:hover:bg-brand/10"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-brand dark:bg-gray-800 dark:text-brand-light">
                    {initials(player.nom_prenom)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{player.nom_prenom}</p>
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                      {player.parent_telephone}
                    </p>
                  </div>
                  <StatusTag isPaid={false} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
