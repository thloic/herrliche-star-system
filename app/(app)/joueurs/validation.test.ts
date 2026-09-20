import { describe, expect, it } from "vitest";
import { validatePlayerInput, type PlayerFormInput } from "./validation";

function validInput(overrides: Partial<PlayerFormInput> = {}): PlayerFormInput {
  return {
    nom_prenom: "AGBETOKA Kodjo Kevin",
    date_naissance: "2014-05-12",
    lieu_naissance: "Lomé",
    telephone: "90875243",
    adresse: "Amadahome",
    parent_nom: "AGBETOKA Kossi",
    parent_telephone: "90875244",
    ...overrides,
  };
}

describe("validatePlayerInput", () => {
  it("n'a aucune erreur pour une saisie complète et valide", () => {
    expect(validatePlayerInput(validInput())).toEqual({});
  });

  it("n'exige pas le téléphone ni l'adresse de l'enfant (optionnels)", () => {
    expect(
      validatePlayerInput(validInput({ telephone: "", adresse: "" })),
    ).toEqual({});
  });

  it("exige le nom et prénom de l'enfant", () => {
    const errors = validatePlayerInput(validInput({ nom_prenom: "  " }));
    expect(errors.nom_prenom).toBeDefined();
  });

  it("exige une date de naissance valide", () => {
    expect(
      validatePlayerInput(validInput({ date_naissance: "" })).date_naissance,
    ).toBeDefined();
    expect(
      validatePlayerInput(validInput({ date_naissance: "pas une date" }))
        .date_naissance,
    ).toBeDefined();
  });

  it("exige le lieu de naissance", () => {
    expect(
      validatePlayerInput(validInput({ lieu_naissance: "" })).lieu_naissance,
    ).toBeDefined();
  });

  it("exige le nom et le téléphone du parent/tuteur", () => {
    const errors = validatePlayerInput(
      validInput({ parent_nom: "", parent_telephone: "" }),
    );
    expect(errors.parent_nom).toBeDefined();
    expect(errors.parent_telephone).toBeDefined();
  });
});
