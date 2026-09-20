import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthlyChart } from "./MonthlyChart";
import type { MonthlyCollection } from "@/lib/dashboard";

function monthsData(): MonthlyCollection[] {
  // 12 mois, du plus ancien (2025-10) au plus récent (2026-09).
  const months: MonthlyCollection[] = [];
  for (let i = 0; i < 12; i++) {
    const year = i < 3 ? 2025 : 2026;
    const month = ((9 + i) % 12) + 1;
    const mois = `${year}-${String(month).padStart(2, "0")}-01`;
    months.push({ mois, paidCount: i, collected: i * 5000 });
  }
  return months;
}

describe("MonthlyChart", () => {
  it("affiche 6 mois par défaut", () => {
    render(<MonthlyChart data={monthsData()} />);
    expect(screen.getByRole("tab", { name: "6 mois" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("change de période au clic et affiche moins/plus de barres", async () => {
    render(<MonthlyChart data={monthsData()} />);

    // Le dernier mois (collected = 11 * 5000 = 55000) est toujours visible.
    expect(screen.getByText("55 k")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "3 mois" }));
    expect(screen.getByRole("tab", { name: "3 mois" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Le mois avec collected = 8 * 5000 = 40000 sort de la fenêtre de 3 mois.
    expect(screen.queryByText("40 k")).not.toBeInTheDocument();
  });

  it("affiche un message si aucun paiement sur la période", () => {
    const empty = monthsData().map((month) => ({
      ...month,
      collected: 0,
      paidCount: 0,
    }));
    render(<MonthlyChart data={empty} />);

    expect(
      screen.getByText("Pas encore de paiement sur cette période."),
    ).toBeInTheDocument();
  });
});
