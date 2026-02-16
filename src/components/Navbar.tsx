"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import InstallButton from "./InstallButton";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const canAccessAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">EPMN</span>
            <span className="hidden sm:inline text-sm text-foreground/60">
              Cahier de Vacances
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {session ? (
              <>
                <Link
                  href="/exercises"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/exercises")
                      ? "text-primary bg-primary-pale/50"
                      : "text-foreground/70 hover:text-primary hover:bg-primary-pale/50"
                  }`}
                >
                  Exercices
                </Link>
                <Link
                  href="/evaluation"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/evaluation")
                      ? "text-primary bg-primary-pale/50"
                      : "text-foreground/70 hover:text-primary hover:bg-primary-pale/50"
                  }`}
                >
                  Evaluation
                </Link>
                {canAccessAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/admin")
                        ? "text-primary bg-primary-pale/50"
                        : "text-foreground/70 hover:text-primary hover:bg-primary-pale/50"
                    }`}
                  >
                    Admin
                  </Link>
                )}

                <div className="w-px h-5 bg-foreground/10 mx-3" />

                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-semibold leading-none">
                      {initials}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground/70">
                    {session.user?.name}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary-pale/50 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="ml-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
                >
                  Creer un compte
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2.5 -mr-1 text-foreground/70 cursor-pointer rounded-lg active:bg-foreground/5"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {session ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-foreground/5">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-sm font-semibold leading-none">
                      {initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{session.user?.name}</p>
                    <p className="text-xs text-foreground/40">{session.user?.email}</p>
                  </div>
                </div>

                <Link
                  href="/exercises"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive("/exercises")
                      ? "text-primary bg-primary-pale/50 font-medium"
                      : "text-foreground/70 hover:bg-primary-pale hover:text-primary"
                  }`}
                >
                  Exercices
                </Link>
                <Link
                  href="/evaluation"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive("/evaluation")
                      ? "text-primary bg-primary-pale/50 font-medium"
                      : "text-foreground/70 hover:bg-primary-pale hover:text-primary"
                  }`}
                >
                  Evaluation
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive("/profile")
                      ? "text-primary bg-primary-pale/50 font-medium"
                      : "text-foreground/70 hover:bg-primary-pale hover:text-primary"
                  }`}
                >
                  Mon profil
                </Link>
                {canAccessAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive("/admin")
                        ? "text-primary bg-primary-pale/50 font-medium"
                        : "text-foreground/70 hover:bg-primary-pale hover:text-primary"
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <div className="px-3 py-2">
                  <InstallButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2.5 rounded-lg text-sm text-foreground/70 hover:bg-primary-pale hover:text-primary transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2.5 rounded-lg bg-primary text-white text-center text-sm hover:bg-primary-light transition-colors"
                >
                  Creer un compte
                </Link>
                <div className="px-3 py-2">
                  <InstallButton />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
