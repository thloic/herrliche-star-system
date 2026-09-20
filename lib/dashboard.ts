import { nextMonthStart } from "./payments";
import type { Payment, Player } from "./types";

export type DashboardStats = {
  totalPlayers: number;
  paidCount: number;
  unpaidCount: number;
  collected: number;
  expected: number;
  unpaidPlayers: Player[];
};

// `currentMonthPayments` doit déjà être filtré sur le mois en cours par
// l'appelant (une requête `.eq("mois", ...)`, pas tout l'historique).
export function computeDashboardStats(
  players: Player[],
  currentMonthPayments: Payment[],
  montantMensuel: number,
): DashboardStats {
  const paidPlayerIds = new Set(
    currentMonthPayments.map((payment) => payment.player_id),
  );
  const unpaidPlayers = players.filter(
    (player) => !paidPlayerIds.has(player.id),
  );
  const paidCount = players.length - unpaidPlayers.length;

  return {
    totalPlayers: players.length,
    paidCount,
    unpaidCount: unpaidPlayers.length,
    collected: paidCount * montantMensuel,
    expected: players.length * montantMensuel,
    unpaidPlayers,
  };
}

export type MonthlyCollection = {
  mois: string;
  paidCount: number;
  collected: number;
};

// Approximation assumée (cohérente avec computeDashboardStats) : le montant
// mensuel peut avoir changé depuis un mois passé, on ne stocke pas le montant
// réellement payé par transaction — on applique le montant actuel à
// l'historique. Suffisant pour une tendance visuelle, pas un livre comptable.
export function computeMonthlyCollections(
  allPayments: Payment[],
  months: string[],
  montantMensuel: number,
): MonthlyCollection[] {
  return months.map((mois) => {
    const paidCount = allPayments.filter(
      (payment) => payment.mois === mois,
    ).length;
    return { mois, paidCount, collected: paidCount * montantMensuel };
  });
}

export type MonthlyComparison = {
  mois: string;
  registeredCount: number;
  paidCount: number;
  unpaidCount: number;
};

// Comparaison payés/en attente mois par mois. `registeredCount` ne compte
// que les enfants déjà inscrits à ce moment-là (via `created_at`) — pas
// l'effectif actuel, pour ne pas compter un enfant comme "en attente" sur
// des mois antérieurs à son inscription.
export function computeMonthlyComparison(
  players: Player[],
  allPayments: Payment[],
  months: string[],
): MonthlyComparison[] {
  return months.map((mois) => {
    const cutoff = nextMonthStart(mois);
    const registeredCount = players.filter(
      (player) => player.created_at < cutoff,
    ).length;
    const paidCount = allPayments.filter(
      (payment) => payment.mois === mois,
    ).length;
    return {
      mois,
      registeredCount,
      paidCount,
      unpaidCount: Math.max(registeredCount - paidCount, 0),
    };
  });
}
