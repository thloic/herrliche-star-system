import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { DeletePlayerDialog } from "./DeletePlayerDialog";

const { deletePlayer } = vi.hoisted(() => ({ deletePlayer: vi.fn() }));
vi.mock("./actions", () => ({ deletePlayer }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("DeletePlayerDialog", () => {
  beforeEach(() => {
    deletePlayer.mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("appelle deletePlayer et ferme la boîte de dialogue en cas de succès", async () => {
    deletePlayer.mockResolvedValue({});
    const onClose = vi.fn();

    render(
      <DeletePlayerDialog
        playerId="player-1"
        playerName="AGBETOKA Kodjo Kevin"
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Supprimer" }));

    await waitFor(() => expect(deletePlayer).toHaveBeenCalledWith("player-1"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "AGBETOKA Kodjo Kevin a été supprimé.",
    );
  });

  it("affiche une erreur et ne ferme pas la boîte si la suppression échoue", async () => {
    deletePlayer.mockResolvedValue({ error: "Erreur lors de la suppression." });
    const onClose = vi.fn();

    render(
      <DeletePlayerDialog
        playerId="player-1"
        playerName="AGBETOKA Kodjo Kevin"
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Supprimer" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Erreur lors de la suppression."),
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
