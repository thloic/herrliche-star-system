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
