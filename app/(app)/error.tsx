"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[app] erreur non gérée", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertTriangle size={32} className="text-red-600 dark:text-red-400" aria-hidden />
      <div>
        <p className="font-semibold">Une erreur est survenue.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Vérifie ta connexion et réessaie. Si ça persiste, redémarre
          l&apos;appli.
        </p>
      </div>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
      >
        Réessayer
      </button>
    </div>
  );
}
