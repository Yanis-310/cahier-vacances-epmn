import Link from "next/link";

export default function NotFound() {
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
        <p className="text-6xl font-bold mb-4" style={{ color: "#F2C073" }}>
          404
        </p>
        <h1 className="text-xl font-semibold text-foreground/90 mb-2">
          Page introuvable
        </h1>
        <p className="text-sm text-foreground/50 mb-6">
          La page que vous recherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 text-white rounded-lg transition-colors font-medium text-sm"
          style={{ backgroundColor: "#F2C073" }}
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
