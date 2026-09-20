export type PlayerFormInput = {
  nom_prenom: string;
  date_naissance: string;
  telephone: string;
  adresse: string;
  parent_nom: string;
  parent_telephone: string;
};

export type PlayerFormErrors = Partial<
  Record<keyof PlayerFormInput | "photo", string>
>;

export function validatePlayerInput(
  input: PlayerFormInput,
): PlayerFormErrors {
  const errors: PlayerFormErrors = {};

  if (!input.nom_prenom.trim()) {
    errors.nom_prenom = "Le nom et prénom de l'enfant sont requis.";
  }

  if (!input.date_naissance.trim()) {
    errors.date_naissance = "La date de naissance est requise.";
  } else if (Number.isNaN(Date.parse(input.date_naissance))) {
    errors.date_naissance = "Date de naissance invalide.";
  }

  if (!input.parent_nom.trim()) {
    errors.parent_nom = "Le nom du parent ou tuteur est requis.";
  }

  if (!input.parent_telephone.trim()) {
    errors.parent_telephone = "Le téléphone du parent ou tuteur est requis.";
  }

  return errors;
}
