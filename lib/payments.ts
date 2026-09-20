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

// Normalise une saisie <input type="month"> ("YYYY-MM") ou une date complète
// ("YYYY-MM-DD") vers le format stocké en base : toujours le 1er du mois.
export function normalizeMonthInput(value: string): string {
  const [year, month] = value.split("-");
  return `${year}-${month}-01`;
}
