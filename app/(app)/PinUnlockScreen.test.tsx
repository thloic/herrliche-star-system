import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { PinUnlockScreen } from "./PinUnlockScreen";

const { verifyPinAttempt, forgotPin } = vi.hoisted(() => ({
  verifyPinAttempt: vi.fn(),
  forgotPin: vi.fn(),
}));
vi.mock("./pin-actions", () => ({ verifyPinAttempt, forgotPin }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("PinUnlockScreen", () => {
  beforeEach(() => {
    verifyPinAttempt.mockReset().mockResolvedValue(undefined);
    vi.mocked(toast.error).mockClear();
  });

  it("affiche le champ code PIN et le bouton de déverrouillage", () => {
    render(<PinUnlockScreen />);

    expect(screen.getByLabelText("Code PIN")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Déverrouiller" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Code oublié ? Se reconnecter avec le compte",
      }),
    ).toBeInTheDocument();
  });

  it("affiche un toast d'erreur si le code est refusé", async () => {
    verifyPinAttempt.mockResolvedValue({ error: "Code incorrect. 4 essais restants." });

    render(<PinUnlockScreen />);
    await userEvent.type(screen.getByLabelText("Code PIN"), "000000");
    await userEvent.click(screen.getByRole("button", { name: "Déverrouiller" }));

    expect(toast.error).toHaveBeenCalledWith("Code incorrect. 4 essais restants.");
  });
});
