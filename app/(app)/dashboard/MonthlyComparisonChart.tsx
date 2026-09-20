"use client";

import { useMemo, useState } from "react";
import { shortMonthLabel } from "@/lib/payments";
import type { MonthlyComparison } from "@/lib/dashboard";

type Period = 3 | 6 | 12;

const PERIODS: { value: Period; label: string }[] = [
  { value: 3, label: "3 mois" },
  { value: 6, label: "6 mois" },
  { value: 12, label: "12 mois" },
];

// Barre empilée payé (bas, vert) / en attente (haut, ambre) par mois — mêmes
// couleurs de statut que partout ailleurs dans l'app (StatusTag), pour que
// la comparaison se lise sans avoir à relire une légende à chaque fois.
export function MonthlyComparisonChart({ data }: { data: MonthlyComparison[] }) {
  const [period, setPeriod] = useState<Period>(6);

  const visible = useMemo(() => data.slice(-period), [data, period]);
  const hasData = visible.some((month) => month.registeredCount > 0);
  const max = Math.max(1, ...visible.map((month) => month.registeredCount));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Payés vs en attente par mois
        </h3>
        <div role="tablist" aria-label="Période" className="flex gap-1">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={period === option.value}
              onClick={() => setPeriod(option.value)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                period === option.value
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" aria-hidden />
          Payés
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden />
          En attente
        </span>
      </div>

      {hasData ? (
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {visible.map((month) => {
            const totalPct =
              month.registeredCount > 0
                ? Math.max((month.registeredCount / max) * 100, 6)
                : 0;
            const paidShare =
              month.registeredCount > 0
                ? (month.paidCount / month.registeredCount) * 100
                : 0;

            return (
              <div
                key={month.mois}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="font-mono text-[10px] font-medium text-gray-600 dark:text-gray-300">
                  {month.registeredCount > 0 ? month.registeredCount : ""}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="flex w-full flex-col justify-end overflow-hidden rounded-t"
                    style={{ height: `${totalPct}%` }}
                    aria-hidden
                  >
                    <div
                      className="w-full bg-amber-400 dark:bg-amber-500/80"
                      style={{ height: `${100 - paidShare}%` }}
                    />
                    <div
                      className="w-full bg-green-500 dark:bg-green-500/80"
                      style={{ height: `${paidShare}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] capitalize text-gray-500 dark:text-gray-400">
                  {shortMonthLabel(month.mois)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Pas encore d&apos;enfant inscrit sur cette période.
        </p>
      )}
    </div>
  );
}
