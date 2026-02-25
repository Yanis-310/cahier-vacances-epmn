"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ backgroundColor: "#FCF4E8" }}
    >
      <img
        src="/icons/solar/fleur 1.png"
        alt=""
        className="absolute object-contain pointer-events-none hidden sm:block"
        style={{ top: "16%", right: "18%", width: "120px", height: "120px" }}
      />

      <div
        className="text-center max-w-md bg-white rounded-xl shadow-sm p-8 relative z-10"
        style={{ border: "1.5px solid #F2C073" }}
      >
        <div
          className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#F2C07320" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 9V15M14 19H14.01"
              stroke="#F2C073"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="14" cy="14" r="11" stroke="#F2C073" strokeWidth="2" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground/90 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-sm text-foreground/50 mb-6">
          Quelque chose s&apos;est mal passe. Veuillez reessayer.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 text-white rounded-lg transition-colors font-medium text-sm cursor-pointer"
          style={{ backgroundColor: "#F2C073" }}
        >
          Reessayer
        </button>
      </div>
    </div>
  );
}
