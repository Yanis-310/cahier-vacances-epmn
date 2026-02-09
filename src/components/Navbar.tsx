"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">EPMN</span>
            <span className="hidden sm:inline text-sm text-foreground/60">
              Cahier de Vacances
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href="/exercises"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  Exercices
                </Link>
                <Link
                  href="/evaluation"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  Évaluation
                </Link>
                <span className="text-sm text-foreground/50">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-foreground/70"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {session ? (
              <>
                <Link
                  href="/exercises"
                  className="block px-3 py-2 rounded-lg text-foreground/70 hover:bg-primary-pale hover:text-primary transition-colors"
                >
                  Exercices
                </Link>
                <Link
                  href="/evaluation"
                  className="block px-3 py-2 rounded-lg text-foreground/70 hover:bg-primary-pale hover:text-primary transition-colors"
                >
                  Évaluation
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left px-3 py-2 rounded-lg text-foreground/70 hover:bg-primary-pale hover:text-primary transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-lg text-foreground/70 hover:bg-primary-pale hover:text-primary transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-lg bg-primary text-white text-center hover:bg-primary-light transition-colors"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
