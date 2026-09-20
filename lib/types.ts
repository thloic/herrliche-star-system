export type Player = {
  id: string;
  photo_path: string | null;
  nom_prenom: string;
  date_naissance: string; // ISO (YYYY-MM-DD)
  lieu_naissance: string;
  telephone: string | null;
  adresse: string | null;
  parent_nom: string;
  parent_telephone: string;
  created_at: string;
};

export type Payment = {
  id: string;
  player_id: string;
  mois: string; // ISO (YYYY-MM-01) — toujours le 1er du mois couvert
  date_paiement: string; // ISO (YYYY-MM-DD)
  created_at: string;
};

export type Settings = {
  id: number;
  montant_mensuel: number;
};
