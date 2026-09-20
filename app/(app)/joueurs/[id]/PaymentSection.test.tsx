import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentSection } from "./PaymentSection";
import type { Payment } from "@/lib/types";

describe("PaymentSection", () => {
  it("propose de marquer payé quand le mois en cours n'est pas payé", () => {
    render(
      <PaymentSection
        playerId="p1"
        currentMonthISO="2026-09-01"
        currentPayment={undefined}
        dueStatus={{ kind: "due_in", days: 5, dueDateISO: "2026-09-10" }}
        montantMensuel={5000}
        history={[]}
      />,
    );

    expect(screen.getByText(/Montant attendu/)).toBeInTheDocument();
    expect(screen.getByText(/5 000/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Marquer payé aujourd'hui" }),
    ).toBeInTheDocument();
  });

  it("affiche la date de paiement quand le mois en cours est payé", () => {
    const currentPayment: Payment = {
      id: "1",
      player_id: "p1",
      mois: "2026-09-01",
      date_paiement: "2026-09-05",
      created_at: "2026-09-05T00:00:00.000Z",
    };

    render(
      <PaymentSection
        playerId="p1"
        currentMonthISO="2026-09-01"
        currentPayment={currentPayment}
        dueStatus={null}
        montantMensuel={5000}
        history={[currentPayment]}
      />,
    );

    expect(screen.getByText(/Payé le 5 septembre 2026/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Marquer payé aujourd'hui" }),
    ).not.toBeInTheDocument();
  });

  it("affiche l'échéance à venir, du jour, ou en retard", () => {
    const { rerender } = render(
      <PaymentSection
        playerId="p1"
        currentMonthISO="2026-09-01"
        currentPayment={undefined}
        dueStatus={{ kind: "due_in", days: 5, dueDateISO: "2026-09-10" }}
        montantMensuel={5000}
        history={[]}
      />,
    );
    expect(screen.getByText("À payer dans 5 jours")).toBeInTheDocument();

    rerender(
      <PaymentSection
        playerId="p1"
        currentMonthISO="2026-09-01"
        currentPayment={undefined}
        dueStatus={{ kind: "due_today", dueDateISO: "2026-09-05" }}
        montantMensuel={5000}
        history={[]}
      />,
    );
    expect(screen.getByText("À payer aujourd'hui")).toBeInTheDocument();

    rerender(
      <PaymentSection
        playerId="p1"
        currentMonthISO="2026-09-01"
        currentPayment={undefined}
        dueStatus={{ kind: "overdue", days: 3, dueDateISO: "2026-09-02" }}
        montantMensuel={5000}
        history={[]}
      />,
    );
    expect(screen.getByText("3 jours de retard")).toBeInTheDocument();
    expect(screen.getByText("-3")).toBeInTheDocument();
  });

  it("affiche/masque le formulaire pour un autre mois au clic", async () => {
    render(
      <PaymentSection
        playerId="p1"
        currentMonthISO="2026-09-01"
        currentPayment={undefined}
        dueStatus={{ kind: "due_in", days: 5, dueDateISO: "2026-09-10" }}
        montantMensuel={5000}
        history={[]}
      />,
    );

    expect(screen.queryByLabelText("Mois")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByText("Enregistrer un paiement pour un autre mois"),
    );
    expect(screen.getByLabelText("Mois")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Annuler"));
    expect(screen.queryByLabelText("Mois")).not.toBeInTheDocument();
  });

  it("affiche l'historique des paiements ou un message si vide", () => {
    const { rerender } = render(
      <PaymentSection
        playerId="p1"
        currentMonthISO="2026-09-01"
        currentPayment={undefined}
        dueStatus={{ kind: "due_in", days: 5, dueDateISO: "2026-09-10" }}
        montantMensuel={5000}
        history={[]}
      />,
    );
    expect(
      screen.getByText("Aucun paiement enregistré pour l'instant."),
    ).toBeInTheDocument();

    rerender(
      <PaymentSection
        playerId="p1"
        currentMonthISO="2026-09-01"
        currentPayment={undefined}
        dueStatus={{ kind: "due_in", days: 5, dueDateISO: "2026-09-10" }}
        montantMensuel={5000}
        history={[
          {
            id: "1",
            player_id: "p1",
            mois: "2026-08-01",
            date_paiement: "2026-08-03",
            created_at: "2026-08-03T00:00:00.000Z",
          },
        ]}
      />,
    );
    expect(screen.getByText("août 2026")).toBeInTheDocument();
  });
});
