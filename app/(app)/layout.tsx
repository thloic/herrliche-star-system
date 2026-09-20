import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Une panne réseau ici (fréquente sur une connexion mobile à Lomé) ne doit
  // pas planter l'appli avec une erreur brute : on traite ça comme "pas
  // connecté" et on renvoie vers /login plutôt que de laisser remonter
  // l'exception (error.tsx de ce segment ne couvre pas son propre layout).
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("[app] impossible de vérifier la session", error);
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-3">
          <span className="font-semibold">Herrliche Stars</span>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              className="text-gray-500 transition-colors hover:text-brand"
            >
              <LogOut size={20} aria-hidden />
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[480px] flex-1 px-4 py-4 pb-24">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto flex w-full max-w-[480px] justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-xs text-gray-600 transition-colors hover:text-brand"
          >
            <LayoutDashboard size={22} aria-hidden />
            Accueil
          </Link>
          <Link
            href="/joueurs"
            className="flex flex-col items-center gap-1 text-xs text-gray-600 transition-colors hover:text-brand"
          >
            <Users size={22} aria-hidden />
            Joueurs
          </Link>
          <Link
            href="/parametres"
            className="flex flex-col items-center gap-1 text-xs text-gray-600 transition-colors hover:text-brand"
          >
            <Settings size={22} aria-hidden />
            Réglages
          </Link>
        </div>
      </nav>
    </div>
  );
}
