import { describe, expect, it } from "vitest";
import {
  computeDashboardStats,
  computeMonthlyCollections,
  computeMonthlyComparison,
} from "./dashboard";
import type { Payment, Player } from "./types";

function player(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    photo_path: null,
    nom_prenom: "Joueur",
    date_naissance: "2014-01-01",
    telephone: null,
    adresse: null,
    parent_nom: "Parent",
    parent_telephone: "90000000",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

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

describe("computeDashboardStats", () => {
  it("compte correctement joueurs payés/en attente et les montants", () => {
    const players = [
      player({ id: "p1" }),
      player({ id: "p2" }),
      player({ id: "p3" }),
    ];
    const currentMonthPayments = [payment({ player_id: "p1" })];

    const stats = computeDashboardStats(players, currentMonthPayments, 5000);

    expect(stats.totalPlayers).toBe(3);
    expect(stats.paidCount).toBe(1);
    expect(stats.unpaidCount).toBe(2);
    expect(stats.collected).toBe(5000);
    expect(stats.expected).toBe(15000);
    expect(stats.unpaidPlayers.map((p) => p.id)).toEqual(["p2", "p3"]);
  });

  it("gère le cas sans aucun joueur", () => {
    const stats = computeDashboardStats([], [], 5000);

    expect(stats.totalPlayers).toBe(0);
    expect(stats.paidCount).toBe(0);
    expect(stats.collected).toBe(0);
    expect(stats.expected).toBe(0);
    expect(stats.unpaidPlayers).toEqual([]);
  });

  it("considère tout le monde payé si chaque joueur a un paiement ce mois", () => {
    const players = [player({ id: "p1" }), player({ id: "p2" })];
    const currentMonthPayments = [
      payment({ player_id: "p1" }),
      payment({ player_id: "p2" }),
    ];

    const stats = computeDashboardStats(players, currentMonthPayments, 5000);

    expect(stats.paidCount).toBe(2);
    expect(stats.unpaidCount).toBe(0);
    expect(stats.unpaidPlayers).toEqual([]);
    expect(stats.collected).toBe(stats.expected);
  });

  it("ignore un paiement dont le player_id ne correspond à aucun joueur (joueur supprimé)", () => {
    const players = [player({ id: "p1" })];
    const currentMonthPayments = [payment({ player_id: "orphelin" })];

    const stats = computeDashboardStats(players, currentMonthPayments, 5000);

    expect(stats.paidCount).toBe(0);
    expect(stats.unpaidPlayers.map((p) => p.id)).toEqual(["p1"]);
  });
});

describe("computeMonthlyCollections", () => {
  it("agrège le nombre de paiements et le montant collecté par mois", () => {
    const payments = [
      payment({ player_id: "p1", mois: "2026-07-01" }),
      payment({ player_id: "p2", mois: "2026-07-01" }),
      payment({ player_id: "p1", mois: "2026-08-01" }),
    ];

    const result = computeMonthlyCollections(
      payments,
      ["2026-07-01", "2026-08-01", "2026-09-01"],
      5000,
    );

    expect(result).toEqual([
      { mois: "2026-07-01", paidCount: 2, collected: 10000 },
      { mois: "2026-08-01", paidCount: 1, collected: 5000 },
      { mois: "2026-09-01", paidCount: 0, collected: 0 },
    ]);
  });

  it("renvoie un tableau vide pour une liste de mois vide", () => {
    expect(computeMonthlyCollections([], [], 5000)).toEqual([]);
  });
});

describe("computeMonthlyComparison", () => {
  it("compare payés/en attente par mois, en excluant les enfants pas encore inscrits", () => {
    const players = [
      player({ id: "p1", created_at: "2026-06-01T00:00:00.000Z" }),
      // p2 inscrit seulement en août : ne doit pas compter comme "en attente" en juillet.
      player({ id: "p2", created_at: "2026-08-15T00:00:00.000Z" }),
    ];
    const payments = [
      payment({ player_id: "p1", mois: "2026-07-01" }),
      payment({ player_id: "p1", mois: "2026-08-01" }),
    ];

    const result = computeMonthlyComparison(
      players,
      payments,
      ["2026-07-01", "2026-08-01"],
    );

    expect(result).toEqual([
      { mois: "2026-07-01", registeredCount: 1, paidCount: 1, unpaidCount: 0 },
      { mois: "2026-08-01", registeredCount: 2, paidCount: 1, unpaidCount: 1 },
    ]);
  });

  it("ne renvoie jamais un compte en attente négatif", () => {
    const players = [player({ id: "p1", created_at: "2026-06-01T00:00:00.000Z" })];
    // Paiement orphelin (joueur supprimé depuis) : ne doit pas rendre unpaidCount négatif.
    const payments = [
      payment({ player_id: "p1", mois: "2026-07-01" }),
      payment({ player_id: "orphelin", mois: "2026-07-01" }),
    ];

    const result = computeMonthlyComparison(players, payments, ["2026-07-01"]);

    expect(result[0].unpaidCount).toBe(0);
  });
});
