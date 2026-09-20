"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeMonthInput } from "@/lib/payments";

export type MarkPaidState = { error?: string; success?: boolean } | undefined;

export async function markPaid(
  playerId: string,
  _prevState: MarkPaidState,
  formData: FormData,
): Promise<MarkPaidState> {
  const moisInput = String(formData.get("mois") ?? "");
  const datePaiement = String(formData.get("date_paiement") ?? "");

  if (!moisInput || !datePaiement) {
    return { error: "Le mois et la date sont requis." };
  }

  const mois = normalizeMonthInput(moisInput);

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .upsert(
      { player_id: playerId, mois, date_paiement: datePaiement },
      { onConflict: "player_id,mois" },
    );

  if (error) {
    return { error: "Erreur lors de l'enregistrement du paiement." };
  }

  revalidatePath(`/joueurs/${playerId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
