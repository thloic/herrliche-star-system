import { createClient } from "@/lib/supabase/server";
import type { Settings } from "@/lib/types";
import { SettingsForm } from "./SettingsForm";

export default async function ParametresPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const settings = data as Settings | null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Réglages</h1>
      <SettingsForm montantMensuel={settings?.montant_mensuel ?? 0} />
    </div>
  );
}
