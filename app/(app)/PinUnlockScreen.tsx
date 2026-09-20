"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { forgotPin, verifyPinAttempt, type VerifyPinState } from "./pin-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-white px-6 py-3 text-base font-semibold text-brand shadow-lg shadow-black/10 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? "Vérification…" : "Déverrouiller"}
    </button>
  );
}

// Rendu par (app)/layout.tsx À LA PLACE de {children} quand l'appareil est
// verrouillé : les données des pages protégées ne sont jamais récupérées ni
// envoyées au navigateur tant que ce composant est affiché — ce n'est pas un
// simple écran qui masque l'appli par-dessus.
export function PinUnlockScreen() {
  const [state, formAction] = useActionState<VerifyPinState, FormData>(
    verifyPinAttempt,
    undefined,
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-brand px-6 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[3px] border-white/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full border-[3px] border-white/10"
      />

      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-md bg-accent">
          <Lock size={24} aria-hidden />
        </span>
        <div className="text-center">
          <h1 className="text-xl font-bold">Appli verrouillée</h1>
          <p className="mt-1 text-sm text-white/70">
            Entre ton code PIN pour continuer.
          </p>
        </div>

        <form
          action={formAction}
          className="flex w-full flex-col items-center gap-4"
        >
          <label htmlFor="pin" className="sr-only">
            Code PIN
          </label>
          <input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus
            required
            autoComplete="off"
            className="w-40 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-white/50"
          />
          <SubmitButton />
        </form>

        <form action={forgotPin}>
          <button
            type="submit"
            className="text-sm text-white/60 underline-offset-2 hover:underline"
          >
            Code oublié ? Se reconnecter avec le compte
          </button>
        </form>
      </div>
    </main>
  );
}
