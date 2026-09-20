"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { updateSettings, type SettingsState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-base font-medium text-white shadow-md shadow-brand/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
    >
      <Save size={18} aria-hidden />
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

export function SettingsForm({ montantMensuel }: { montantMensuel: number }) {
  const [state, formAction] = useActionState<SettingsState, FormData>(
    updateSettings,
    undefined,
  );

  useEffect(() => {
    if (state?.success) toast.success("Montant mensuel mis à jour.");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="montant_mensuel"
          className="text-sm font-medium text-gray-700"
        >
          Montant mensuel (F CFA)
        </label>
        <input
          id="montant_mensuel"
          name="montant_mensuel"
          type="number"
          min="1"
          step="1"
          defaultValue={montantMensuel}
          required
          className="rounded-lg border border-gray-300 px-4 py-3 text-base"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
