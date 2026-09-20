import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "./LogoutButton";

const { logout } = vi.hoisted(() => ({ logout: vi.fn() }));
vi.mock("./actions", () => ({ logout }));

describe("LogoutButton", () => {
  beforeEach(() => {
    logout.mockReset().mockResolvedValue(undefined);
  });

  it("n'affiche pas de confirmation par défaut", () => {
    render(<LogoutButton />);
    expect(screen.queryByText("Se déconnecter ?")).not.toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });

  it("affiche une confirmation au clic sur le bouton", async () => {
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));

    expect(screen.getByText("Se déconnecter ?")).toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });

  it("annule sans se déconnecter", async () => {
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));
    await userEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(screen.queryByText("Se déconnecter ?")).not.toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });

  it("appelle logout() en confirmant", async () => {
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));
    // Deux boutons portent maintenant le nom "Se déconnecter" (icône + confirmation) :
    const confirmButtons = screen.getAllByRole("button", { name: "Se déconnecter" });
    await userEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => expect(logout).toHaveBeenCalled());
  });
});
