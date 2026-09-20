import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerDetails } from "./PlayerDetails";
import type { Player } from "@/lib/types";

const player: Player = {
  id: "1",
  photo_path: null,
  nom_prenom: "AGBETOKA Kodjo Kevin",
  date_naissance: "2014-05-12",
  telephone: null,
  adresse: null,
  parent_nom: "AGBETOKA Kossi",
  parent_telephone: "90875244",
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("PlayerDetails", () => {
  it("affiche les informations du joueur", () => {
    render(<PlayerDetails player={player} photoUrl={null} />);

    expect(screen.getByText("AGBETOKA Kodjo Kevin")).toBeInTheDocument();
    expect(screen.getByText("12 mai 2014")).toBeInTheDocument();
    expect(screen.getByText("AGBETOKA Kossi")).toBeInTheDocument();
    expect(screen.getByText("90875244")).toBeInTheDocument();
  });

  it("affiche un tiret pour le téléphone et l'adresse absents", () => {
    render(<PlayerDetails player={player} photoUrl={null} />);

    const dashes = screen.getAllByText("—");
    expect(dashes).toHaveLength(2);
  });

  it("affiche la photo quand une URL signée est fournie", () => {
    render(
      <PlayerDetails
        player={player}
        photoUrl="https://example.com/signed.jpg"
      />,
    );

    expect(screen.getByRole("img", { name: "AGBETOKA Kodjo Kevin" })).toHaveAttribute(
      "src",
      "https://example.com/signed.jpg",
    );
  });
});
