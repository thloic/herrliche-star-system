import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { PinSettings } from "./PinSettings";

const { enablePin, changePin, disablePin, lockNow } = vi.hoisted(() => ({
  enablePin: vi.fn(),
  changePin: vi.fn(),
  disablePin: vi.fn(),
  lockNow: vi.fn(),
}));
vi.mock("../pin-actions", () => ({ enablePin, changePin, disablePin, lockNow }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("PinSettings", () => {
  beforeEach(() => {
    enablePin.mockReset().mockResolvedValue(undefined);
    changePin.mockReset().mockResolvedValue(undefined);
    disablePin.mockReset().mockResolvedValue(undefined);
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("propose d'activer le PIN quand il n'est pas encore configuré", () => {
    render(<PinSettings pinEnabled={false} />);

    expect(screen.getByLabelText("Nouveau code (6 chiffres)")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirme le code")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Activer le code PIN" }),
    ).toBeInTheDocument();
  });

  it("propose verrouiller / modifier / désactiver quand le PIN est actif", () => {
    render(<PinSettings pinEnabled />);

    expect(screen.getByText("Code PIN activé sur cet appareil.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verrouiller maintenant" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Modifier le code" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Désactiver le code PIN" }),
    ).toBeInTheDocument();
  });

  it("déplie le formulaire de modification au clic", async () => {
    render(<PinSettings pinEnabled />);

    expect(screen.queryByLabelText("Code actuel")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Modifier le code" }));
    expect(screen.getByLabelText("Code actuel")).toBeInTheDocument();
    expect(screen.getByLabelText("Nouveau code")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByLabelText("Code actuel")).not.toBeInTheDocument();
  });

  it("déplie le formulaire de désactivation au clic", async () => {
    render(<PinSettings pinEnabled />);

    await userEvent.click(
      screen.getByRole("button", { name: "Désactiver le code PIN" }),
    );
    expect(screen.getByLabelText("Code actuel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Désactiver" })).toBeInTheDocument();
  });
});
