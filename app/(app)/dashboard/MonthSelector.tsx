"use client";

import { useRouter } from "next/navigation";
import { normalizeMonthInput } from "@/lib/payments";

// <input type="month"> plutôt qu'un <select> limité aux 12 derniers mois :
// le coach doit pouvoir consulter n'importe quel mois passé, pas seulement
// une liste fixe — et ça reste un contrôle natif, léger, avec un vrai
// sélecteur mobile (roue de mois sur iOS/Android).
export function MonthSelector({ selected }: { selected: string }) {
  const router = useRouter();

  return (
    <input
      type="month"
      aria-label="Choisir le mois"
      value={selected.slice(0, 7)}
      onChange={(event) => {
        if (!event.target.value) return;
        router.push(`/dashboard?mois=${normalizeMonthInput(event.target.value)}`);
      }}
      className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white outline-none"
    />
  );
}
