export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        <h1 className="text-lg font-semibold text-foreground/90">Chargement en cours</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Veuillez patienter quelques instants.
        </p>
      </div>
    </div>
  );
}
