export default function Loading() {
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
          className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2"
          style={{ borderColor: "#F2C07355", borderTopColor: "#F2C073" }}
        />
        <h1 className="text-lg font-semibold text-foreground/90">Chargement en cours</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Veuillez patienter quelques instants.
        </p>
      </div>
    </div>
  );
}
