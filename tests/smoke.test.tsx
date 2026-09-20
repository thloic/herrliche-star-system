import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

describe("test setup", () => {
  it("rend un composant et lit le DOM (vitest + RTL + jest-dom opérationnels)", () => {
    render(<button>Marquer payé</button>);
    expect(screen.getByRole("button", { name: "Marquer payé" })).toBeInTheDocument();
  });
});
