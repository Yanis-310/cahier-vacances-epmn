"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 9V15M14 19H14.01" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="14" cy="14" r="11" stroke="var(--color-error)" strokeWidth="2" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground/90 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-sm text-foreground/50 mb-6">
          Quelque chose s&apos;est mal passé. Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium text-sm cursor-pointer"
        >
          Reessayer
        </button>
      </div>
    </div>
  );
}
