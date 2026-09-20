"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Payment } from "@/lib/types";
import {
  formatAmount,
  formatDate,
  formatMonthLabel,
  todayISO,
} from "@/lib/payments";
import { markPaid, type MarkPaidState } from "./actions";

function SubmitButton({
  label,
  pendingLabel,
  variant = "accent",
}: {
  label: string;
  pendingLabel: string;
  variant?: "accent" | "brand";
}) {
  const { pending } = useFormStatus();
  const colorClass =
    variant === "accent"
      ? "bg-accent shadow-accent/20 hover:shadow-accent/30"
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

export function PaymentSection({
  playerId,
  currentMonthISO,
  currentPayment,
  montantMensuel,
  history,
}: {
  playerId: string;
  currentMonthISO: string;
  currentPayment?: Payment;
  montantMensuel: number;
  history: Payment[];
}) {
  const boundMarkPaid = markPaid.bind(null, playerId);
  const [state, formAction] = useActionState<MarkPaidState, FormData>(
    boundMarkPaid,
    undefined,
  );
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    if (state?.success) toast.success("Paiement enregistré.");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-500">
          Ce mois-ci ({formatMonthLabel(currentMonthISO)})
        </p>
        {currentPayment ? (
          <div className="mt-2 flex items-center gap-2 text-green-600">
            <CheckCircle2 size={20} aria-hidden />
            <span className="font-medium">
              Payé le {formatDate(currentPayment.date_paiement)}
            </span>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-sm text-gray-600">
              Montant attendu : {formatAmount(montantMensuel)}
            </p>
            <form action={formAction}>
              <input type="hidden" name="mois" value={currentMonthISO} />
              <input type="hidden" name="date_paiement" value={todayISO()} />
              <SubmitButton
                label="Marquer payé aujourd'hui"
                pendingLabel="Enregistrement…"
                variant="accent"
              />
            </form>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowCustom((value) => !value)}
          className="text-sm font-medium text-brand hover:underline"
        >
          {showCustom
            ? "Annuler"
            : "Enregistrer un paiement pour un autre mois"}
        </button>
        {showCustom && (
          <form
            action={formAction}
            className="mt-3 flex flex-col gap-3 rounded-lg border border-gray-200 p-4"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="mois"
                className="text-sm font-medium text-gray-700"
              >
                Mois
              </label>
              <input
                id="mois"
                name="mois"
                type="month"
                required
                className="rounded-lg border border-gray-300 px-4 py-3 text-base"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="date_paiement"
                className="text-sm font-medium text-gray-700"
              >
                Date du paiement
              </label>
              <input
                id="date_paiement"
                name="date_paiement"
                type="date"
                required
                defaultValue={todayISO()}
                className="rounded-lg border border-gray-300 px-4 py-3 text-base"
              />
            </div>
            <SubmitButton
              label="Enregistrer"
              pendingLabel="Enregistrement…"
              variant="brand"
            />
          </form>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Historique
        </p>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun paiement enregistré pour l&apos;instant.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
              >
                <span className="font-medium capitalize">
                  {formatMonthLabel(payment.mois)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(payment.date_paiement)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
