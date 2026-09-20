"use client";

import { useEffect } from "react";

// Enregistré seulement en production : en dev, ça ajoute plus de confusion
// (assets mis en cache pendant le hot-reload) que de valeur.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // L'installation en PWA reste possible sans service worker (juste
      // pas de cache offline) — on ne bloque rien si ça échoue.
    });
  }, []);

  return null;
}
