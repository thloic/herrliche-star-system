import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthlyComparisonChart } from "./MonthlyComparisonChart";
import type { MonthlyComparison } from "@/lib/dashboard";

function monthsData(): MonthlyComparison[] {
  const months: MonthlyComparison[] = [];
  for (let i = 0; i < 12; i++) {
    const year = i < 3 ? 2025 : 2026;
    const month = ((9 + i) % 12) + 1;
    const mois = `${year}-${String(month).padStart(2, "0")}-01`;
    months.push({
      mois,
      registeredCount: 10,
      paidCount: i,
      unpaidCount: 10 - i,
    });
  }
  return months;
}

describe("MonthlyComparisonChart", () => {
  it("affiche la légende payés/en attente", () => {
    render(<MonthlyComparisonChart data={monthsData()} />);
    expect(screen.getByText("Payés")).toBeInTheDocument();
    expect(screen.getByText("En attente")).toBeInTheDocument();
  });

  it("affiche 6 mois par défaut et change de période au clic", async () => {
    render(<MonthlyComparisonChart data={monthsData()} />);

    expect(screen.getByRole("tab", { name: "6 mois" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Le dernier mois (registeredCount = 10) est toujours affiché.
    expect(screen.getAllByText("10")).toHaveLength(6);

    await userEvent.click(screen.getByRole("tab", { name: "3 mois" }));
    expect(screen.getAllByText("10")).toHaveLength(3);
  });

  it("affiche un message si personne n'est inscrit sur la période", () => {
    const empty = monthsData().map((month) => ({
      ...month,
      registeredCount: 0,
      paidCount: 0,
      unpaidCount: 0,
    }));
    render(<MonthlyComparisonChart data={empty} />);

    expect(
      screen.getByText("Pas encore d'enfant inscrit sur cette période."),
    ).toBeInTheDocument();
  });
});
