import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/players";
import {
  computeAnchorDay,
  computeDueStatus,
  currentMonthStart,
  dueDateForMonth,
  findPaymentForMonth,
  formatMonthLabel,
  todayISO,
} from "@/lib/payments";
import type { Payment, Player, Settings } from "@/lib/types";
import { PlayerList, type PlayerWithPhoto } from "./PlayerList";

export default async function JoueursPage() {
  const supabase = await createClient();
  const currentMonthISO = currentMonthStart();

  const [{ data: playersData }, { data: paymentsData }, { data: settingsData }] =
    await Promise.all([
      supabase
        .from("players")
        .select("*")
        .order("nom_prenom", { ascending: true }),
      supabase
        .from("payments")
        .select("*")
        .order("mois", { ascending: false }),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);

  const players = (playersData ?? []) as Player[];
  const allPayments = (paymentsData ?? []) as Payment[];
  const settings = settingsData as Settings | null;
  const montantMensuel = settings?.montant_mensuel ?? 0;
  const today = todayISO();

  const paymentsByPlayer = new Map<string, Payment[]>();
  for (const payment of allPayments) {
    const list = paymentsByPlayer.get(payment.player_id) ?? [];
    list.push(payment);
    paymentsByPlayer.set(payment.player_id, list);
  }

  const photoUrls = await getSignedPhotoUrls(
    supabase,
    players.map((player) => player.photo_path),
  );

  const withPhotos: PlayerWithPhoto[] = players.map((player) => {
    const playerPayments = paymentsByPlayer.get(player.id) ?? [];
    const currentPayment =
      findPaymentForMonth(playerPayments, currentMonthISO) ?? null;

    const dueStatus = currentPayment
      ? null
      : computeDueStatus(
          dueDateForMonth(
            computeAnchorDay(
              playerPayments.filter((p) => p.mois < currentMonthISO),
              player.created_at,
            ),
            currentMonthISO,
          ),
          today,
        );

    return {
      ...player,
      photoUrl: player.photo_path ? (photoUrls[player.photo_path] ?? null) : null,
      isPaidThisMonth: !!currentPayment,
      currentPayment,
      dueStatus,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Joueurs</h1>
      <PlayerList
        players={withPhotos}
        monthLabel={formatMonthLabel(currentMonthISO)}
        montantMensuel={montantMensuel}
      />
    </div>
  );
}
