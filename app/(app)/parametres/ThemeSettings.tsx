"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/ThemeProvider";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Selon le téléphone", icon: Monitor },
];

export function ThemeSettings() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Apparence"
      className="flex w-full max-w-sm flex-col gap-2"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setPreference(value)}
            // La préférence vient de localStorage, indisponible côté serveur :
            // le premier rendu client peut légitimement différer du HTML
            // serveur ici (aria-checked / couleur du bouton sélectionné).
            suppressHydrationWarning
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
              selected
                ? "border-brand bg-brand/5 text-brand dark:bg-brand/15"
                : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            <Icon size={20} aria-hidden />
            <span className="font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
