"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    href: "/admin",
    label: "Exercices",
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
    href: "/admin/analytics",
    label: "Statistiques",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 4-6" />
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
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user.name || "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const visibleItems = navItems.filter(
    (item) => !item.requiredRole || user.role === item.requiredRole
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      {/* Header */}
      <div className="px-5 pb-4 pt-6">
        <div className="text-xl font-bold tracking-tight text-white">EPMN</div>
        <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-500">
          Administration
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-l-2 border-primary bg-slate-800 text-white"
                  : "border-l-2 border-transparent hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Separator + Back link */}
      <div className="border-t border-slate-700/50 px-3 py-3">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Retour au site
        </Link>
      </div>

      {/* User footer */}
      <div className="border-t border-slate-700/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {user.name || "Admin"}
            </div>
            <div className="truncate text-xs text-slate-500">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] lg:shrink-0">
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
        <span className="text-sm font-bold text-slate-900">EPMN</span>
        <span className="text-xs font-medium text-slate-400">Administration</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
