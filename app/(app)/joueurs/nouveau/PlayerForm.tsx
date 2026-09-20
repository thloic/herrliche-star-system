"use client";

import { useActionState, useEffect } from "react";
import { Camera, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createPlayer, type PlayerFormState } from "../actions";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = "rounded-lg border border-gray-300 px-4 py-3 text-base";

export function PlayerForm() {
  const [state, formAction, pending] = useActionState<
    PlayerFormState,
    FormData
  >(createPlayer, undefined);
  const errors = state?.errors ?? {};

  useEffect(() => {
    if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <Field id="photo" label="Photo">
        <label
          htmlFor="photo"
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-gray-500"
        >
          <Camera size={20} aria-hidden />
          Ajouter une photo
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          className="sr-only"
        />
      </Field>

      <Field
        id="nom_prenom"
        label="Nom et prénom de l'enfant"
        error={errors.nom_prenom}
      >
        <input id="nom_prenom" name="nom_prenom" required className={inputClass} />
      </Field>

      <Field
        id="date_naissance"
        label="Date de naissance"
        error={errors.date_naissance}
      >
        <input
          id="date_naissance"
          name="date_naissance"
          type="date"
          required
          className={inputClass}
        />
      </Field>

      <Field
        id="lieu_naissance"
        label="Lieu de naissance"
        error={errors.lieu_naissance}
      >
        <input
          id="lieu_naissance"
          name="lieu_naissance"
          required
          className={inputClass}
        />
      </Field>

      <Field id="telephone" label="Téléphone (enfant/famille)">
        <input id="telephone" name="telephone" type="tel" className={inputClass} />
      </Field>

      <Field id="adresse" label="Résidence / adresse">
        <input id="adresse" name="adresse" className={inputClass} />
      </Field>

      <Field
        id="parent_nom"
        label="Nom et prénom du parent ou tuteur"
        error={errors.parent_nom}
      >
        <input id="parent_nom" name="parent_nom" required className={inputClass} />
      </Field>

      <Field
        id="parent_telephone"
        label="Téléphone du parent ou tuteur"
        error={errors.parent_telephone}
      >
        <input
          id="parent_telephone"
          name="parent_telephone"
          type="tel"
          required
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-base font-medium text-white shadow-md shadow-brand/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
      >
        <UserPlus size={18} aria-hidden />
        {pending ? "Enregistrement…" : "Inscrire l'enfant"}
      </button>
    </form>
  );
}
