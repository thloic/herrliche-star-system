import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// En PWA installée (mode standalone), il n'y a pas de barre d'adresse avec
// bouton retour : chaque écran qui n'est pas une destination de la nav du
// bas a besoin d'un chemin explicite pour revenir en arrière.
export function BackLink({
  href = "/joueurs",
  label = "Retour",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-brand"
    >
      <ChevronLeft size={18} aria-hidden />
      {label}
    </Link>
  );
}
