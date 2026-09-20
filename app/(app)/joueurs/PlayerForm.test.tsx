import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerForm } from "./PlayerForm";
import type { Player } from "@/lib/types";
import type { PlayerFormState } from "./actions";

async function noopAction(): Promise<PlayerFormState> {
  return undefined;
}

describe("PlayerForm", () => {
  it("affiche tous les champs de la fiche joueur en mode création, photo obligatoire", () => {
    render(<PlayerForm mode="create" action={noopAction} />);

    const photoInput = screen.getByLabelText("Photo (obligatoire)");
    expect(photoInput).toBeInTheDocument();
    expect(photoInput).toBeRequired();
    expect(
      screen.getByLabelText("Nom et prénom de l'enfant"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Date de naissance")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Téléphone (enfant/famille)"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Résidence / adresse")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Nom et prénom du parent ou tuteur"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Téléphone du parent ou tuteur"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Inscrire l'enfant" }),
    ).toBeInTheDocument();
  });

  it("pré-remplit les champs et adapte le bouton en mode édition, photo optionnelle", () => {
    const player: Player = {
      id: "1",
      photo_path: null,
      nom_prenom: "AGBETOKA Kodjo Kevin",
      date_naissance: "2014-05-12",
      telephone: "90875243",
      adresse: "Amadahome",
      parent_nom: "AGBETOKA Kossi",
      parent_telephone: "90875244",
      created_at: "2026-01-01T00:00:00.000Z",
    };

    render(
      <PlayerForm mode="edit" action={noopAction} defaultValues={player} />,
    );

    expect(
      screen.getByLabelText("Nom et prénom de l'enfant"),
    ).toHaveValue("AGBETOKA Kodjo Kevin");
    expect(screen.getByLabelText("Photo")).not.toBeRequired();
    expect(
      screen.getByRole("button", { name: "Enregistrer les modifications" }),
    ).toBeInTheDocument();
  });

  it("affiche la photo actuelle et propose de la changer en mode édition", () => {
    render(
      <PlayerForm
        mode="edit"
        action={noopAction}
        currentPhotoUrl="https://example.com/photo.jpg"
      />,
    );

    expect(screen.getByText("Changer la photo")).toBeInTheDocument();
  });
});
