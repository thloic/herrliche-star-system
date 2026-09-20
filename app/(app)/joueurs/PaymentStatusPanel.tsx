"use client";

import { useTransition } from "react";
import { CheckCircle2, Clock, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  formatAmount,
  formatDate,
  formatDueStatus,
  todayISO,
  type DueStatus,
} from "@/lib/payments";
import type { Payment } from "@/lib/types";
import { markPaid } from "./[id]/actions";

export function PaymentStatusPanel({
  playerId,
  playerName,
  currentMonthISO,
  currentPayment,
  dueStatus,
  montantMensuel,
  onClose,
}: {
  playerId: string;
  playerName: string;
  currentMonthISO: string;
  currentPayment: Payment | null;
  dueStatus: DueStatus | null;
  montantMensuel: number;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleMarkPaid() {
    const formData = new FormData();
    formData.set("mois", currentMonthISO);
    formData.set("date_paiement", todayISO());

    startTransition(async () => {
      const result = await markPaid(playerId, undefined, formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Paiement enregistré.");
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl dark:bg-gray-900 sm:rounded-2xl">
        <h2 className="text-lg font-bold">{playerName}</h2>

        {currentPayment ? (
          <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 size={20} aria-hidden />
            <span className="font-medium">
              Payé le {formatDate(currentPayment.date_paiement)}
            </span>
          </div>
        ) : dueStatus ? (
          <div className="mt-4 flex flex-col gap-3">
            <div
              className={`flex items-center gap-2 ${
                dueStatus.kind === "overdue"
                  ? "text-red-600 dark:text-red-400"
                  : dueStatus.kind === "due_today"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {dueStatus.kind === "overdue" ? (
                <TriangleAlert size={20} aria-hidden />
              ) : (
                <Clock size={20} aria-hidden />
              )}
              <span className="font-medium">
                {dueStatus.kind === "overdue" && (
                  <span className="mr-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-500/15 dark:text-red-400">
                    -{dueStatus.days}
                  </span>
                )}
                {formatDueStatus(dueStatus)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Montant attendu : {formatAmount(montantMensuel)}
            </p>
            <button
              type="button"
              onClick={handleMarkPaid}
              disabled={pending}
              className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-base font-medium text-white shadow-md shadow-accent/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
            >
              {pending ? "Enregistrement…" : "Enregistrer le paiement"}
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="mt-6 w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
