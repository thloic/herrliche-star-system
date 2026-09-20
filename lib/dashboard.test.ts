import { describe, expect, it } from "vitest";
import { computeDashboardStats } from "./dashboard";
import type { Payment, Player } from "./types";

function player(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    photo_path: null,
    nom_prenom: "Joueur",
    date_naissance: "2014-01-01",
    lieu_naissance: "Lomé",
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
