import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="text-xl font-semibold text-foreground/90 mb-2">
          Page introuvable
        </h1>
        <p className="text-sm text-foreground/50 mb-6">
          La page que vous recherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium text-sm"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
