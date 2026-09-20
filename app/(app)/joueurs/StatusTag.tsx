// "En attente" reste neutre (ambre) : le rouge est réservé au retard réel,
// affiché uniquement dans le panneau ouvert au clic (voir PaymentStatusPanel).
export function StatusTag({
  isPaid,
  onClick,
}: {
  isPaid: boolean;
  onClick?: () => void;
}) {
  const label = isPaid ? "Payé" : "En attente";
  const colorClass = isPaid
    ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400"
    : "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400";

  if (!onClick) {
    return (
      <span
        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${colorClass}`}
      >
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition-transform hover:scale-105 active:scale-95 ${colorClass}`}
    >
      {label}
    </button>
  );
}
