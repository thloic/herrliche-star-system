"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deletePlayer } from "./actions";

export function DeletePlayerDialog({
  playerId,
  playerName,
  onClose,
}: {
  playerId: string;
  playerName: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deletePlayer(playerId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${playerName} a été supprimé.`);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div
        role="alertdialog"
        aria-labelledby="delete-player-title"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
      >
        <h2 id="delete-player-title" className="text-lg font-bold">
          Supprimer {playerName} ?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Son historique de paiements sera aussi supprimé. Cette action est
          irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
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
            {pending ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
