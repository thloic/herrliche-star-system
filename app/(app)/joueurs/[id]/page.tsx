import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/players";
import {
  computeAnchorDay,
  computeDueStatus,
  currentMonthStart,
  dueDateForMonth,
  findPaymentForMonth,
  todayISO,
} from "@/lib/payments";
import type { Payment, Player, Settings } from "@/lib/types";
import { BackLink } from "../BackLink";
import { PlayerDetails } from "./PlayerDetails";
import { PlayerCreatedToast } from "./PlayerCreatedToast";
import { PaymentSection } from "./PaymentSection";

export default async function JoueurPage(props: PageProps<"/joueurs/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const player = data as Player;
  const photoUrls = await getSignedPhotoUrls(supabase, [player.photo_path]);
  const photoUrl = player.photo_path
    ? (photoUrls[player.photo_path] ?? null)
    : null;

  const [{ data: paymentsData }, { data: settingsData }] = await Promise.all([
    supabase
      .from("payments")
      .select("*")
      .eq("player_id", id)
      .order("mois", { ascending: false }),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const payments = (paymentsData ?? []) as Payment[];
  const settings = settingsData as Settings | null;
  const currentMonthISO = currentMonthStart();
  const currentPayment = findPaymentForMonth(payments, currentMonthISO);
  const dueStatus = currentPayment
    ? null
    : computeDueStatus(
        dueDateForMonth(
          computeAnchorDay(
            payments.filter((p) => p.mois < currentMonthISO),
            player.created_at,
          ),
          currentMonthISO,
        ),
        todayISO(),
      );

  return (
    <div className="flex flex-col gap-8">
      <PlayerCreatedToast />
      <BackLink />
      <PlayerDetails player={player} photoUrl={photoUrl} />
      <PaymentSection
        playerId={player.id}
        currentMonthISO={currentMonthISO}
        currentPayment={currentPayment}
        dueStatus={dueStatus}
        montantMensuel={settings?.montant_mensuel ?? 0}
        history={payments}
      />
    </div>
  );
}
