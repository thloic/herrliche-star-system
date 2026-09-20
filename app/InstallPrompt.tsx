"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// Ne se déclenche que sur les navigateurs qui supportent l'installation PWA
// (Chrome/Edge Android, essentiellement) — l'événement `beforeinstallprompt`
// n'existe pas sur iOS Safari ni Firefox, donc ce composant n'affiche rien
// là-bas (l'installation y reste manuelle, voir docs/DESIGN.md).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_STORAGE_KEY = "hs_install_dismissed_at";
const DISMISS_COOLDOWN_DAYS = 7;

function recentlyDismissed(): boolean {
  try {
    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!dismissedAt) return false;
    const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
    return days < DISMISS_COOLDOWN_DAYS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
  } catch {
    // Best-effort : au pire, le modal se represente plus tôt que prévu.
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      if (recentlyDismissed()) return;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  if (!deferredPrompt) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    rememberDismissal();
    setDeferredPrompt(null);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl dark:bg-gray-900">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-accent text-white">
          <Download size={24} aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-bold">Installer Herrliche Stars</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Ajoute l&apos;appli à ton écran d&apos;accueil pour l&apos;ouvrir en
          un geste, comme une vraie application.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            Installer
          </button>
        </div>
      </div>
    </div>
  );
}
