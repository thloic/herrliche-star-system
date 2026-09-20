export function Spinner() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div
        role="status"
        aria-label="Chargement"
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand"
      />
    </div>
  );
}
