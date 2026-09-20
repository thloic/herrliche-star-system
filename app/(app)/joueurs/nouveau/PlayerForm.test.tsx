import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerForm } from "./PlayerForm";

describe("PlayerForm", () => {
  it("affiche tous les champs de la fiche joueur", () => {
    render(<PlayerForm />);

    expect(screen.getByLabelText("Photo")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Nom et prénom de l'enfant"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Date de naissance")).toBeInTheDocument();
    expect(screen.getByLabelText("Lieu de naissance")).toBeInTheDocument();
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
});
