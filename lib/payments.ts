import type { Payment } from "./types";

export function currentMonthStart(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function todayISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function findPaymentForMonth(
  payments: Payment[],
  mois: string,
): Payment | undefined {
  return payments.find((payment) => payment.mois === mois);
}

export function isPaidForMonth(payments: Payment[], mois: string): boolean {
  return findPaymentForMonth(payments, mois) !== undefined;
}

export function formatMonthLabel(mois: string): string {
  return new Date(`${mois}T00:00:00`).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatAmount(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} F CFA`;
}

// Version compacte pour les libellés directs sur un mini graphique (ex.
// "50 k F" au lieu de "50 000 F CFA") — la place manque dans une petite barre.
export function formatShortAmount(amount: number): string {
  if (amount === 0) return "0";
  if (amount >= 1_000_000) {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(amount / 1_000_000)} M`;
  }
  if (amount >= 1_000) {
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount / 1_000)} k`;
  }
  return new Intl.NumberFormat("fr-FR").format(amount);
}

export function shortMonthLabel(mois: string): string {
  return new Date(`${mois}T00:00:00`).toLocaleDateString("fr-FR", {
    month: "short",
  });
}

// Les N derniers mois (dont le mois en cours), du plus ancien au plus récent
// — sert de base commune à la personnalisation de période du dashboard.
export function lastNMonths(n: number, from: Date = new Date()): string[] {
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    months.push(
      currentMonthStart(new Date(from.getFullYear(), from.getMonth() - i, 1)),
    );
  }
  return months;
}

// Premier jour du mois suivant — sert à savoir si un joueur était déjà
// inscrit pendant un mois donné (created_at < nextMonthStart(mois)).
export function nextMonthStart(monthISO: string): string {
  const [year, month] = monthISO.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
}

// Normalise une saisie <input type="month"> ("YYYY-MM") ou une date complète
// ("YYYY-MM-DD") vers le format stocké en base : toujours le 1er du mois.
export function normalizeMonthInput(value: string): string {
  const [year, month] = value.split("-");
  return `${year}-${month}-01`;
}

// Échéance individuelle par enfant : le jour du mois de son dernier paiement
// (ou de son inscription, s'il n'a jamais payé) sert d'ancre chaque mois.
export function computeAnchorDay(
  priorPayments: Payment[],
  registrationDateISO: string,
): number {
  const last = [...priorPayments].sort((a, b) => b.mois.localeCompare(a.mois))[0];
  const sourceDate = last ? last.date_paiement : registrationDateISO;
  return new Date(`${sourceDate}T00:00:00`).getDate();
}

// Un jour ancre absent du mois (ex. 31 en février) est ramené au dernier
// jour de ce mois.
export function dueDateForMonth(anchorDay: number, monthISO: string): string {
  const [year, month] = monthISO.split("-").map(Number);
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const day = Math.min(anchorDay, lastDayOfMonth);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type DueStatus =
  | { kind: "due_in"; days: number; dueDateISO: string }
  | { kind: "due_today"; dueDateISO: string }
  | { kind: "overdue"; days: number; dueDateISO: string };

export function computeDueStatus(
  dueDateISO: string,
  todayISOStr: string,
): DueStatus {
  const due = new Date(`${dueDateISO}T00:00:00`);
  const today = new Date(`${todayISOStr}T00:00:00`);
  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays > 0) return { kind: "due_in", days: diffDays, dueDateISO };
  if (diffDays === 0) return { kind: "due_today", dueDateISO };
  return { kind: "overdue", days: -diffDays, dueDateISO };
}

function pluralJours(count: number): string {
  return count > 1 ? "jours" : "jour";
}

export function formatDueStatus(status: DueStatus): string {
  switch (status.kind) {
    case "due_in":
      return `À payer dans ${status.days} ${pluralJours(status.days)}`;
    case "due_today":
      return "À payer aujourd'hui";
    case "overdue":
      return `${status.days} ${pluralJours(status.days)} de retard`;
  }
}
