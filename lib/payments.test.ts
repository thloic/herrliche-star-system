import { describe, expect, it } from "vitest";
import {
  currentMonthStart,
  findPaymentForMonth,
  formatAmount,
  formatDate,
  formatMonthLabel,
  isPaidForMonth,
  normalizeMonthInput,
  todayISO,
} from "./payments";
import type { Payment } from "./types";

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "1",
    player_id: "p1",
    mois: "2026-09-01",
    date_paiement: "2026-09-05",
    created_at: "2026-09-05T00:00:00.000Z",
    ...overrides,
  };
}

describe("currentMonthStart", () => {
  it("renvoie toujours le 1er du mois de la date donnée", () => {
    expect(currentMonthStart(new Date(2026, 8, 19))).toBe("2026-09-01");
    expect(currentMonthStart(new Date(2026, 0, 31))).toBe("2026-01-01");
  });
});

describe("todayISO", () => {
  it("formate une date en YYYY-MM-DD", () => {
    expect(todayISO(new Date(2026, 8, 5))).toBe("2026-09-05");
  });
});

describe("findPaymentForMonth / isPaidForMonth", () => {
  const payments = [payment({ mois: "2026-08-01" }), payment({ mois: "2026-09-01" })];

  it("trouve le paiement du mois demandé", () => {
    expect(findPaymentForMonth(payments, "2026-09-01")?.mois).toBe("2026-09-01");
    expect(findPaymentForMonth(payments, "2026-10-01")).toBeUndefined();
  });

  it("indique si un mois est payé", () => {
    expect(isPaidForMonth(payments, "2026-08-01")).toBe(true);
    expect(isPaidForMonth(payments, "2026-10-01")).toBe(false);
  });
});

describe("formatMonthLabel / formatDate / formatAmount", () => {
  it("formate un mois en toutes lettres", () => {
    expect(formatMonthLabel("2026-09-01")).toBe("septembre 2026");
  });

  it("formate une date en toutes lettres", () => {
    expect(formatDate("2026-09-05")).toBe("5 septembre 2026");
  });

  it("formate un montant avec séparateur de milliers et devise", () => {
    const grouped = new Intl.NumberFormat("fr-FR").format(5000);
    expect(formatAmount(5000)).toBe(`${grouped} F CFA`);
  });
});

describe("normalizeMonthInput", () => {
  it("normalise une saisie YYYY-MM vers le 1er du mois", () => {
    expect(normalizeMonthInput("2026-09")).toBe("2026-09-01");
  });

  it("normalise aussi une date complète déjà au 1er du mois", () => {
    expect(normalizeMonthInput("2026-09-01")).toBe("2026-09-01");
  });
});
