import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <SearchX size={32} className="text-gray-300 dark:text-gray-600" aria-hidden />
      <p className="font-semibold">Introuvable.</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Cette fiche ou cette page n&apos;existe pas (ou plus).
      </p>
      <Link
        href="/dashboard"
        className="mt-2 text-sm font-medium text-brand hover:underline dark:text-brand-light"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
