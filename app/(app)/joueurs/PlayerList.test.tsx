import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerList, type PlayerWithPhoto } from "./PlayerList";

const players: PlayerWithPhoto[] = [
  {
    id: "1",
    photo_path: null,
    photoUrl: null,
    nom_prenom: "AGBETOKA Kodjo Kevin",
    date_naissance: "2014-05-12",
    lieu_naissance: "Lomé",
    telephone: null,
    adresse: null,
    parent_nom: "AGBETOKA Kossi",
    parent_telephone: "90875244",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    photo_path: null,
    photoUrl: null,
    nom_prenom: "DOSSEH Ama",
    date_naissance: "2015-03-01",
    lieu_naissance: "Kara",
    telephone: null,
    adresse: null,
    parent_nom: "DOSSEH Kofi",
    parent_telephone: "90000000",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

describe("PlayerList", () => {
  it("affiche tous les joueurs par défaut", () => {
    render(<PlayerList players={players} />);

    expect(screen.getByText("AGBETOKA Kodjo Kevin")).toBeInTheDocument();
    expect(screen.getByText("DOSSEH Ama")).toBeInTheDocument();
  });

  it("filtre par nom au fur et à mesure de la recherche", async () => {
    render(<PlayerList players={players} />);

    await userEvent.type(
      screen.getByLabelText("Rechercher un enfant"),
      "dosseh",
    );

    expect(screen.queryByText("AGBETOKA Kodjo Kevin")).not.toBeInTheDocument();
    expect(screen.getByText("DOSSEH Ama")).toBeInTheDocument();
  });

  it("affiche un message de recherche sans résultat, distinct de l'état vide", async () => {
    render(<PlayerList players={players} />);

    await userEvent.type(
      screen.getByLabelText("Rechercher un enfant"),
      "zzz",
    );

    expect(screen.getByText("Aucun résultat pour « zzz ».")).toBeInTheDocument();
    expect(
      screen.queryByText("Aucun enfant inscrit pour l'instant."),
    ).not.toBeInTheDocument();
  });

  it("affiche un état de premier lancement quand il n'y a aucun enfant inscrit", () => {
    render(<PlayerList players={[]} />);

    expect(
      screen.getByText("Aucun enfant inscrit pour l'instant."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Inscrire le premier enfant" }),
    ).toHaveAttribute("href", "/joueurs/nouveau");
  });
});
