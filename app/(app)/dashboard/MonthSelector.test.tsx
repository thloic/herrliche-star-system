import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { MonthSelector } from "./MonthSelector";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("MonthSelector", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("affiche le mois sélectionné", () => {
    render(<MonthSelector selected="2026-08-01" />);

    const input = screen.getByLabelText("Choisir le mois") as HTMLInputElement;
    expect(input.value).toBe("2026-08");
  });

  it("navigue vers /dashboard?mois=... au changement, normalisé au 1er du mois", () => {
    render(<MonthSelector selected="2026-08-01" />);

    fireEvent.change(screen.getByLabelText("Choisir le mois"), {
      target: { value: "2026-03" },
    });

    expect(push).toHaveBeenCalledWith("/dashboard?mois=2026-03-01");
  });

  it("permet de choisir n'importe quel mois, pas seulement les 12 derniers", () => {
    render(<MonthSelector selected="2026-08-01" />);

    fireEvent.change(screen.getByLabelText("Choisir le mois"), {
      target: { value: "2019-01" },
    });

    expect(push).toHaveBeenCalledWith("/dashboard?mois=2019-01-01");
  });
});
