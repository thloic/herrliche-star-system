import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { PaymentStatusPanel } from "./PaymentStatusPanel";

const { markPaid } = vi.hoisted(() => ({ markPaid: vi.fn() }));
vi.mock("./[id]/actions", () => ({ markPaid }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("PaymentStatusPanel", () => {
  beforeEach(() => {
    markPaid.mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("affiche la date de paiement quand le mois est déjà payé", () => {
    render(
      <PaymentStatusPanel
        playerId="p1"
        playerName="AGBETOKA Kodjo Kevin"
        currentMonthISO="2026-09-01"
        currentPayment={{
          id: "1",
          player_id: "p1",
          mois: "2026-09-01",
          date_paiement: "2026-09-05",
          created_at: "2026-09-05T00:00:00.000Z",
        }}
        dueStatus={null}
        montantMensuel={5000}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/Payé le 5 septembre 2026/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Enregistrer le paiement" }),
    ).not.toBeInTheDocument();
  });

  it("affiche l'échéance et enregistre le paiement au clic", async () => {
    markPaid.mockResolvedValue({ success: true });
    const onClose = vi.fn();

    render(
      <PaymentStatusPanel
        playerId="p1"
        playerName="AGBETOKA Kodjo Kevin"
        currentMonthISO="2026-09-01"
        currentPayment={null}
        dueStatus={{ kind: "overdue", days: 3, dueDateISO: "2026-09-02" }}
        montantMensuel={5000}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("3 jours de retard")).toBeInTheDocument();
    expect(screen.getByText("-3")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Enregistrer le paiement" }),
    );

    await waitFor(() =>
      expect(markPaid).toHaveBeenCalledWith(
        "p1",
        undefined,
        expect.any(FormData),
      ),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Paiement enregistré.");
  });

  it("affiche une erreur sans fermer le panneau si l'enregistrement échoue", async () => {
    markPaid.mockResolvedValue({ error: "Erreur lors de l'enregistrement du paiement." });
    const onClose = vi.fn();

    render(
      <PaymentStatusPanel
        playerId="p1"
        playerName="AGBETOKA Kodjo Kevin"
        currentMonthISO="2026-09-01"
        currentPayment={null}
        dueStatus={{ kind: "due_today", dueDateISO: "2026-09-05" }}
        montantMensuel={5000}
        onClose={onClose}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Enregistrer le paiement" }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Erreur lors de l'enregistrement du paiement.",
      ),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ferme le panneau via le bouton Fermer", async () => {
    const onClose = vi.fn();
    render(
      <PaymentStatusPanel
        playerId="p1"
        playerName="AGBETOKA Kodjo Kevin"
        currentMonthISO="2026-09-01"
        currentPayment={null}
        dueStatus={{ kind: "due_in", days: 5, dueDateISO: "2026-09-10" }}
        montantMensuel={5000}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalled();
  });
});
