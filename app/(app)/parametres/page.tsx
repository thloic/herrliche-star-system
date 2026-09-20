import { cookies } from "next/headers";
import type { LucideIcon } from "lucide-react";
import { Lock, Palette, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DEVICE_ID_COOKIE } from "@/lib/pin";
import type { Settings } from "@/lib/types";
import { SettingsForm } from "./SettingsForm";
import { ThemeSettings } from "./ThemeSettings";
import { PinSettings } from "./PinSettings";

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand dark:bg-brand-light/15 dark:text-brand-light">
          <Icon size={20} aria-hidden />
        </span>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const deviceId = cookieStore.get(DEVICE_ID_COOKIE)?.value;

  const [{ data: settingsData }, { data: pinLockData }] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    user && deviceId
      ? supabase
          .from("pin_locks")
          .select("id")
          .eq("user_id", user.id)
          .eq("device_id", deviceId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const settings = settingsData as Settings | null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold">Réglages</h1>

      <Section
        title="Montant mensuel"
        description="Le tarif appliqué à chaque enfant, chaque mois."
        icon={Wallet}
      >
        <SettingsForm montantMensuel={settings?.montant_mensuel ?? 0} />
      </Section>

      <Section
        title="Apparence"
        description="Clair, sombre, ou selon ton téléphone."
        icon={Palette}
      >
        <ThemeSettings />
      </Section>

      <Section
        title="Accès rapide"
        description="Déverrouille l'appli sur ce téléphone sans ressaisir ton mot de passe."
        icon={Lock}
      >
        <PinSettings pinEnabled={!!pinLockData} />
      </Section>
    </div>
  );
}
