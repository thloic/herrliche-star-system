import { describe, expect, it } from "vitest";
import {
  computeAnchorDay,
  computeDueStatus,
  currentMonthStart,
  dueDateForMonth,
  findPaymentForMonth,
  formatAmount,
  formatDate,
  formatDueStatus,
  formatMonthLabel,
  formatShortAmount,
  isPaidForMonth,
  lastNMonths,
  nextMonthStart,
  normalizeMonthInput,
  shortMonthLabel,
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

describe("computeAnchorDay", () => {
  it("utilise le jour du dernier paiement s'il existe", () => {
    const payments = [
      payment({ mois: "2026-07-01", date_paiement: "2026-07-03" }),
      payment({ mois: "2026-08-01", date_paiement: "2026-08-08" }),
    ];
    expect(computeAnchorDay(payments, "2025-01-15")).toBe(8);
  });

  it("prend le paiement le plus récent quand il y en a plusieurs", () => {
    const payments = [
      payment({ mois: "2026-08-01", date_paiement: "2026-08-08" }),
      payment({ mois: "2026-06-01", date_paiement: "2026-06-20" }),
    ];
    expect(computeAnchorDay(payments, "2025-01-15")).toBe(8);
  });

  it("utilise la date d'inscription si l'enfant n'a jamais payé", () => {
    expect(computeAnchorDay([], "2025-01-15")).toBe(15);
  });
});

describe("dueDateForMonth", () => {
  it("applique le jour ancre au mois donné", () => {
    expect(dueDateForMonth(8, "2026-09")).toBe("2026-09-08");
  });

  it("ramène un jour absent du mois à son dernier jour (ex. 31 en février)", () => {
    expect(dueDateForMonth(31, "2026-02")).toBe("2026-02-28");
  });

  it("gère les années bissextiles", () => {
    expect(dueDateForMonth(31, "2028-02")).toBe("2028-02-29");
  });
});

describe("computeDueStatus", () => {
  it("indique le nombre de jours restants avant l'échéance", () => {
    expect(computeDueStatus("2026-09-10", "2026-09-05")).toEqual({
      kind: "due_in",
      days: 5,
      dueDateISO: "2026-09-10",
    });
  });

  it("indique que l'échéance est aujourd'hui", () => {
    expect(computeDueStatus("2026-09-05", "2026-09-05")).toEqual({
      kind: "due_today",
      dueDateISO: "2026-09-05",
    });
  });

  it("indique un retard en jours", () => {
    expect(computeDueStatus("2026-09-05", "2026-09-08")).toEqual({
      kind: "overdue",
      days: 3,
      dueDateISO: "2026-09-05",
    });
  });
});

describe("formatDueStatus", () => {
  it("gère le singulier et le pluriel pour les jours restants", () => {
    expect(
      formatDueStatus({ kind: "due_in", days: 1, dueDateISO: "2026-09-06" }),
    ).toBe("À payer dans 1 jour");
    expect(
      formatDueStatus({ kind: "due_in", days: 5, dueDateISO: "2026-09-10" }),
    ).toBe("À payer dans 5 jours");
  });

  it("formate l'échéance du jour même", () => {
    expect(
      formatDueStatus({ kind: "due_today", dueDateISO: "2026-09-05" }),
    ).toBe("À payer aujourd'hui");
  });

  it("gère le singulier et le pluriel pour le retard", () => {
    expect(
      formatDueStatus({ kind: "overdue", days: 1, dueDateISO: "2026-09-04" }),
    ).toBe("1 jour de retard");
    expect(
      formatDueStatus({ kind: "overdue", days: 3, dueDateISO: "2026-09-02" }),
    ).toBe("3 jours de retard");
  });
});

describe("formatShortAmount", () => {
  it("affiche 0 tel quel", () => {
    expect(formatShortAmount(0)).toBe("0");
  });

  it("affiche les petits montants sans suffixe", () => {
    expect(formatShortAmount(500)).toBe("500");
  });

  it("abrège les milliers en k", () => {
    expect(formatShortAmount(5000)).toBe("5 k");
    expect(formatShortAmount(50000)).toBe("50 k");
  });

  it("abrège les millions en M", () => {
    expect(formatShortAmount(1500000)).toBe("1,5 M");
  });
});

describe("shortMonthLabel", () => {
  it("formate un mois en abrégé", () => {
    expect(shortMonthLabel("2026-09-01")).toMatch(/sept/i);
  });
});

describe("lastNMonths", () => {
  it("renvoie les N derniers mois du plus ancien au plus récent, mois courant inclus", () => {
    const from = new Date(2026, 8, 19); // 19 septembre 2026
    expect(lastNMonths(3, from)).toEqual([
      "2026-07-01",
      "2026-08-01",
      "2026-09-01",
    ]);
  });

  it("traverse correctement un changement d'année", () => {
    const from = new Date(2026, 1, 10); // 10 février 2026
    expect(lastNMonths(3, from)).toEqual([
      "2025-12-01",
      "2026-01-01",
      "2026-02-01",
    ]);
  });
});

describe("nextMonthStart", () => {
  it("renvoie le 1er du mois suivant", () => {
    expect(nextMonthStart("2026-09-01")).toBe("2026-10-01");
  });

  it("traverse correctement un changement d'année", () => {
    expect(nextMonthStart("2026-12-01")).toBe("2027-01-01");
  });
});
