import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstallPrompt } from "./InstallPrompt";

function fireBeforeInstallPrompt(overrides: { prompt?: () => Promise<void> } = {}) {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  };
  event.prompt = overrides.prompt ?? vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: "accepted" });
  window.dispatchEvent(event);
  return event;
}

describe("InstallPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("n'affiche rien tant que l'événement n'a pas été déclenché", () => {
    render(<InstallPrompt />);
    expect(screen.queryByText("Installer Herrliche Stars")).not.toBeInTheDocument();
  });

  it("affiche le modal quand beforeinstallprompt se déclenche", async () => {
    render(<InstallPrompt />);
    fireBeforeInstallPrompt();

    expect(
      await screen.findByText("Installer Herrliche Stars"),
    ).toBeInTheDocument();
  });

  it("appelle prompt() et ferme le modal au clic sur Installer", async () => {
    render(<InstallPrompt />);
    const prompt = vi.fn().mockResolvedValue(undefined);
    fireBeforeInstallPrompt({ prompt });

    await screen.findByText("Installer Herrliche Stars");
    await userEvent.click(screen.getByRole("button", { name: "Installer" }));

    expect(prompt).toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.queryByText("Installer Herrliche Stars"),
      ).not.toBeInTheDocument(),
    );
  });

  it("ferme le modal et mémorise le refus au clic sur Plus tard", async () => {
    render(<InstallPrompt />);
    fireBeforeInstallPrompt();
    await screen.findByText("Installer Herrliche Stars");

    await userEvent.click(screen.getByRole("button", { name: "Plus tard" }));

    expect(
      screen.queryByText("Installer Herrliche Stars"),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem("hs_install_dismissed_at")).not.toBeNull();
  });

  it("ne réaffiche pas le modal si récemment refusé", async () => {
    localStorage.setItem("hs_install_dismissed_at", String(Date.now()));
    render(<InstallPrompt />);
    fireBeforeInstallPrompt();

    // Laisse le temps à un éventuel (mauvais) rendu d'apparaître.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(screen.queryByText("Installer Herrliche Stars")).not.toBeInTheDocument();
  });
});
