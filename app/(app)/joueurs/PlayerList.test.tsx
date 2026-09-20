import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerList, type PlayerWithPhoto } from "./PlayerList";

const { deletePlayer, markPaid } = vi.hoisted(() => ({
  deletePlayer: vi.fn(),
  markPaid: vi.fn(),
}));
vi.mock("./actions", () => ({ deletePlayer }));
vi.mock("./[id]/actions", () => ({ markPaid }));

function player(overrides: Partial<PlayerWithPhoto>): PlayerWithPhoto {
  return {
    id: "1",
    photo_path: null,
    photoUrl: null,
    nom_prenom: "Joueur",
    date_naissance: "2014-05-12",
    telephone: null,
    adresse: null,
    parent_nom: "Parent",
    parent_telephone: "90000000",
    created_at: "2026-01-01T00:00:00.000Z",
    isPaidThisMonth: false,
    currentPayment: null,
    dueStatus: { kind: "due_in", days: 5, dueDateISO: "2026-09-10" },
    ...overrides,
  };
}

const players: PlayerWithPhoto[] = [
  player({
    id: "1",
    nom_prenom: "AGBETOKA Kodjo Kevin",
    isPaidThisMonth: false,
  }),
  player({
    id: "2",
    nom_prenom: "DOSSEH Ama",
    isPaidThisMonth: true,
    currentPayment: {
      id: "p1",
      player_id: "2",
      mois: "2026-09-01",
      date_paiement: "2026-09-05",
      created_at: "2026-09-05T00:00:00.000Z",
    },
    dueStatus: null,
  }),
];

describe("PlayerList", () => {
  beforeEach(() => {
    deletePlayer.mockReset().mockResolvedValue({});
    markPaid.mockReset().mockResolvedValue({ success: true });
  });

  it("affiche le mois en cours et tous les joueurs par défaut", () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    expect(screen.getByText("Paiements de septembre 2026")).toBeInTheDocument();
    expect(screen.getByText("AGBETOKA Kodjo Kevin")).toBeInTheDocument();
    expect(screen.getByText("DOSSEH Ama")).toBeInTheDocument();
  });

  it("affiche le bon tag de statut par joueur", () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    expect(
      screen.getAllByRole("button", { name: "En attente" }),
    ).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Payé" })).toHaveLength(1);
  });

  it("filtre par nom au fur et à mesure de la recherche", async () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    await userEvent.type(
      screen.getByLabelText("Rechercher un enfant"),
      "dosseh",
    );

    expect(screen.queryByText("AGBETOKA Kodjo Kevin")).not.toBeInTheDocument();
    expect(screen.getByText("DOSSEH Ama")).toBeInTheDocument();
  });

  it("filtre par statut via les onglets", async () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    await userEvent.click(screen.getByRole("tab", { name: "Payés" }));
    expect(screen.queryByText("AGBETOKA Kodjo Kevin")).not.toBeInTheDocument();
    expect(screen.getByText("DOSSEH Ama")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "En attente" }));
    expect(screen.getByText("AGBETOKA Kodjo Kevin")).toBeInTheDocument();
    expect(screen.queryByText("DOSSEH Ama")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Tous" }));
    expect(screen.getByText("AGBETOKA Kodjo Kevin")).toBeInTheDocument();
    expect(screen.getByText("DOSSEH Ama")).toBeInTheDocument();
  });

  it("distingue absence de résultat de recherche et filtre sans résultat", async () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    await userEvent.type(
      screen.getByLabelText("Rechercher un enfant"),
      "zzz",
    );
    expect(screen.getByText("Aucun résultat pour « zzz ».")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText("Rechercher un enfant"));
    await userEvent.click(screen.getByRole("tab", { name: "Payés" }));
    await userEvent.type(
      screen.getByLabelText("Rechercher un enfant"),
      "agbetoka",
    );
    expect(screen.getByText("Aucun résultat pour « agbetoka ».")).toBeInTheDocument();
  });

  it("affiche un état de premier lancement quand il n'y a aucun enfant inscrit", () => {
    render(
      <PlayerList players={[]} monthLabel="septembre 2026" montantMensuel={5000} />,
    );

    expect(
      screen.getByText("Aucun enfant inscrit pour l'instant."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Inscrire le premier enfant" }),
    ).toHaveAttribute("href", "/joueurs/nouveau");
  });

  it("ouvre le menu d'un joueur puis affiche la confirmation de suppression", async () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    const menuButtons = screen.getAllByRole("button", { name: "Actions" });
    await userEvent.click(menuButtons[0]);
    await userEvent.click(screen.getByRole("menuitem", { name: "Supprimer" }));

    expect(
      screen.getByText("Supprimer AGBETOKA Kodjo Kevin ?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/historique de paiements sera aussi supprimé/),
    ).toBeInTheDocument();
  });

  it("annule la suppression sans appeler l'action serveur", async () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    await userEvent.click(screen.getAllByRole("button", { name: "Actions" })[0]);
    await userEvent.click(screen.getByRole("menuitem", { name: "Supprimer" }));
    await userEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(
      screen.queryByText("Supprimer AGBETOKA Kodjo Kevin ?"),
    ).not.toBeInTheDocument();
    expect(deletePlayer).not.toHaveBeenCalled();
  });

  it("ouvre le panneau de statut au clic sur le tag et affiche l'échéance", async () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "En attente" }));

    expect(screen.getByText("À payer dans 5 jours")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enregistrer le paiement" }),
    ).toBeInTheDocument();
  });

  it("affiche la date de paiement dans le panneau pour un joueur déjà payé", async () => {
    render(
      <PlayerList
        players={players}
        monthLabel="septembre 2026"
        montantMensuel={5000}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Payé" }));

    expect(screen.getByText(/Payé le 5 septembre 2026/)).toBeInTheDocument();
  });
});
