"use client";

import { useMemo, useState } from "react";
import { formatShortAmount, shortMonthLabel } from "@/lib/payments";
import type { MonthlyCollection } from "@/lib/dashboard";

type Period = 3 | 6 | 12;

const PERIODS: { value: Period; label: string }[] = [
  { value: 3, label: "3 mois" },
  { value: 6, label: "6 mois" },
  { value: 12, label: "12 mois" },
];

// Barres simples, valeurs affichées directement (pas d'axe, pas de survol) :
// pensé pour un coach non technique sur téléphone — tout se lit d'un coup
// d'œil, sans interaction requise. `data` est déjà trié du plus ancien au
// plus récent, sur la période maximale (12 mois) ; on découpe côté client
// selon le bouton choisi, sans nouvel aller-retour serveur.
export function MonthlyChart({ data }: { data: MonthlyCollection[] }) {
  const [period, setPeriod] = useState<Period>(6);

  const visible = useMemo(() => data.slice(-period), [data, period]);
  const hasData = visible.some((month) => month.collected > 0);
  const max = Math.max(1, ...visible.map((month) => month.collected));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Montant collecté par mois
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

      {hasData ? (
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {visible.map((month) => {
            const heightPct =
              month.collected > 0 ? Math.max((month.collected / max) * 100, 6) : 0;
            return (
              <div
                key={month.mois}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="font-mono text-[10px] font-medium text-gray-600 dark:text-gray-300">
                  {month.collected > 0 ? formatShortAmount(month.collected) : ""}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-brand dark:bg-brand-light"
                    style={{ height: `${heightPct}%` }}
                    aria-hidden
                  />
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
          Pas encore de paiement sur cette période.
        </p>
      )}
    </div>
  );
}
