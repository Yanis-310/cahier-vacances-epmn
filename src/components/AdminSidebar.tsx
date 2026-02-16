"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

type AdminSidebarProps = {
  user: {
    name: string | null;
    email: string | null;
    role: string;
  };
};

const navItems = [
  {
    href: "/admin/analytics",
    label: "Tableau de bord",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    requiredRole: null,
  },
  {
    href: "/admin",
    label: "Exercices",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    requiredRole: null,
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    requiredRole: "OWNER" as const,
  },
  {
    href: "/admin/settings",
    label: "Paramètres",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    requiredRole: "OWNER" as const,
  },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const visibleItems = navItems.filter(
    (item) => !item.requiredRole || user.role === item.requiredRole || user.role === "OWNER"
  );

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="px-5 pb-6 pt-7">
        <div className="text-lg font-bold text-primary">EPMN</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Cahier de vacances
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-l-[3px] border-primary bg-primary-pale/50 text-primary"
                  : "border-l-[3px] border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="border-t border-slate-100 px-3 py-3 space-y-1">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Retour au site
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3h-9m0 0l3-3m-3 3l3 3" />
          </svg>
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[240px] lg:shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
        <span className="text-sm font-bold text-primary">EPMN</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cahier de vacances</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[240px] lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
