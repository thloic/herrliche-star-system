"use client";

import { useActionState, useEffect } from "react";
import { Camera, Save, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Player } from "@/lib/types";
import type { PlayerFormState } from "./actions";

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
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

export function PlayerForm({
  mode,
  action,
  defaultValues,
  currentPhotoUrl,
}: {
  mode: "create" | "edit";
  action: (
    state: PlayerFormState,
    formData: FormData,
  ) => Promise<PlayerFormState>;
  defaultValues?: Player;
  currentPhotoUrl?: string | null;
}) {
  const [state, formAction, pending] = useActionState<
    PlayerFormState,
    FormData
  >(action, undefined);
  const errors = state?.errors ?? {};
  const Icon = mode === "create" ? UserPlus : Save;
  const submitLabel =
    mode === "create" ? "Inscrire l'enfant" : "Enregistrer les modifications";

  useEffect(() => {
    if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <Field
        id="photo"
        label={mode === "create" ? "Photo (obligatoire)" : "Photo"}
        error={errors.photo}
      >
        {currentPhotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- URL signée éphémère, pas d'intérêt à optimiser via next/image
          <img
            src={currentPhotoUrl}
            alt=""
            className="mb-2 h-16 w-16 rounded-full object-cover"
          />
        )}
        <label
          htmlFor="photo"
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-gray-500 dark:border-gray-600 dark:text-gray-400"
        >
          <Camera size={20} aria-hidden />
          {currentPhotoUrl ? "Changer la photo" : "Ajouter une photo"}
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          required={mode === "create"}
          className="sr-only"
        />
      </Field>

      <Field
        id="nom_prenom"
        label="Nom et prénom de l'enfant"
        error={errors.nom_prenom}
      >
        <input
          id="nom_prenom"
          name="nom_prenom"
          required
          defaultValue={defaultValues?.nom_prenom}
          className={inputClass}
        />
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
          defaultValue={defaultValues?.date_naissance}
          className={inputClass}
        />
      </Field>

      <Field id="telephone" label="Téléphone (enfant/famille)">
        <input
          id="telephone"
          name="telephone"
          type="tel"
          defaultValue={defaultValues?.telephone ?? ""}
          className={inputClass}
        />
      </Field>

      <Field id="adresse" label="Résidence / adresse">
        <input
          id="adresse"
          name="adresse"
          defaultValue={defaultValues?.adresse ?? ""}
          className={inputClass}
        />
      </Field>

      <Field
        id="parent_nom"
        label="Nom et prénom du parent ou tuteur"
        error={errors.parent_nom}
      >
        <input
          id="parent_nom"
          name="parent_nom"
          required
          defaultValue={defaultValues?.parent_nom}
          className={inputClass}
        />
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
          defaultValue={defaultValues?.parent_telephone}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-base font-medium text-white shadow-md shadow-brand/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
      >
        <Icon size={18} aria-hidden />
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
