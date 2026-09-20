"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "./actions";

export function LogoutButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Se déconnecter"
        className="text-gray-500 transition-colors hover:text-brand dark:text-gray-400 dark:hover:text-brand-light"
      >
        <LogOut size={20} aria-hidden />
      </button>

      {confirming && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div
            role="alertdialog"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <h2 id="logout-title" className="text-lg font-bold">
              Se déconnecter ?
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Tu devras te reconnecter avec ton email et ton mot de passe
              pour revenir dans l&apos;appli.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {pending ? "Déconnexion…" : "Se déconnecter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
