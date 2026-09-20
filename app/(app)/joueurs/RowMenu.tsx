"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

export function RowMenu({
  playerId,
  onDelete,
}: {
  playerId: string;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-light"
      >
        <MoreVertical size={20} aria-hidden />
      </button>

      {open && (
        <>
          {/* Backdrop transparent : ferme le menu au clic n'importe où ailleurs. */}
          <div
            className="fixed inset-0 z-10"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
          >
            <Link
              href={`/joueurs/${playerId}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Eye size={16} aria-hidden />
              Voir
            </Link>
            <Link
              href={`/joueurs/${playerId}/modifier`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Pencil size={16} aria-hidden />
              Modifier
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 size={16} aria-hidden />
              Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
