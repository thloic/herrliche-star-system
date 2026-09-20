export type Player = {
  id: string;
  photo_path: string | null;
  nom_prenom: string;
  date_naissance: string; // ISO (YYYY-MM-DD)
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

export type PinLock = {
  id: string;
  user_id: string;
  device_id: string;
  pin_hash: string;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
};
