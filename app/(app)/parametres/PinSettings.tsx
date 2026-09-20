"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  changePin,
  disablePin,
  enablePin,
  lockNow,
  type PinFormState,
} from "../pin-actions";

const pinInputClass =
  "rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-lg tracking-[0.3em] text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

function PinField({ id, name, label }: { id: string; name: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        required
        autoComplete="off"
        className={pinInputClass}
      />
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  variant = "brand",
}: {
  label: string;
  pendingLabel: string;
  variant?: "brand" | "danger";
}) {
  const { pending } = useFormStatus();
  const colorClass =
    variant === "danger"
      ? "bg-red-600 shadow-red-600/20 hover:shadow-red-600/30"
      : "bg-brand shadow-brand/20 hover:shadow-brand/30";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-base font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 ${colorClass}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function EnablePinForm() {
  const [state, formAction] = useActionState<PinFormState, FormData>(
    enablePin,
    undefined,
  );

  useEffect(() => {
    if (state?.success) toast.success("Code PIN activé sur cet appareil.");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Ajoute un code à 6 chiffres pour déverrouiller l&apos;appli
        rapidement sur cet appareil, sans ressaisir ton mot de passe à chaque
        fois.
      </p>
      <PinField id="pin" name="pin" label="Nouveau code (6 chiffres)" />
      <PinField id="pin_confirm" name="pin_confirm" label="Confirme le code" />
      <SubmitButton label="Activer le code PIN" pendingLabel="Activation…" />
    </form>
  );
}

function ManagePinForms() {
  const [changeState, changeAction] = useActionState<PinFormState, FormData>(
    changePin,
    undefined,
  );
  const [disableState, disableAction] = useActionState<PinFormState, FormData>(
    disablePin,
    undefined,
  );
  const [showChange, setShowChange] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    if (changeState?.success) {
      toast.success("Code PIN mis à jour.");
      // Repliage du formulaire en réaction au résultat d'un round-trip
      // serveur (useActionState), pas une valeur dérivable au rendu sans
      // perdre la bascule manuelle du bouton "Modifier le code".
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowChange(false);
    }
    if (changeState?.error) toast.error(changeState.error);
  }, [changeState]);

  useEffect(() => {
    if (disableState?.success) {
      toast.success("Code PIN désactivé.");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- idem ci-dessus
      setShowDisable(false);
    }
    if (disableState?.error) toast.error(disableState.error);
  }, [disableState]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <p className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
        <CheckCircle2 size={16} aria-hidden />
        Code PIN activé sur cet appareil.
      </p>

      <form action={lockNow}>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-full bg-gray-100 px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Lock size={18} aria-hidden />
          Verrouiller maintenant
        </button>
      </form>

      <div>
        <button
          type="button"
          onClick={() => setShowChange((value) => !value)}
          className="text-sm font-medium text-brand hover:underline dark:text-brand-light"
        >
          {showChange ? "Annuler" : "Modifier le code"}
        </button>
        {showChange && (
          <form
            action={changeAction}
            className="mt-3 flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <PinField id="change_current_pin" name="current_pin" label="Code actuel" />
            <PinField id="change_new_pin" name="new_pin" label="Nouveau code" />
            <PinField
              id="change_new_pin_confirm"
              name="new_pin_confirm"
              label="Confirme le nouveau code"
            />
            <SubmitButton label="Enregistrer" pendingLabel="Enregistrement…" />
          </form>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowDisable((value) => !value)}
          className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
        >
          {showDisable ? "Annuler" : "Désactiver le code PIN"}
        </button>
        {showDisable && (
          <form
            action={disableAction}
            className="mt-3 flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <PinField id="disable_current_pin" name="current_pin" label="Code actuel" />
            <SubmitButton
              label="Désactiver"
              pendingLabel="Désactivation…"
              variant="danger"
            />
          </form>
        )}
      </div>
    </div>
  );
}

export function PinSettings({ pinEnabled }: { pinEnabled: boolean }) {
  return pinEnabled ? <ManagePinForms /> : <EnablePinForm />;
}
