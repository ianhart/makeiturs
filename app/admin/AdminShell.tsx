"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function AdminShell({
  children,
  clients,
}: {
  children: ReactNode;
  clients?: { id: number; name: string; slug: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">M</span>
            </div>
            <div>
              <h1 className="font-bold text-sm">Make It Urs</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a
            href="/admin"
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === "/admin"
                ? "bg-slate-700 text-white font-medium"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            All Clients
          </a>

          {clients && clients.length > 0 && (
            <div className="pt-3">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Clients
              </p>
              {clients.map((c) => (
                <a
                  key={c.id}
                  href={`/admin/clients/${c.id}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname.startsWith(`/admin/clients/${c.id}`)
                      ? "bg-slate-700 text-white font-medium"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {c.name}
                </a>
              ))}
            </div>
          )}

          <div className="pt-3">
            <a
              href="/admin/clients/new"
              className="block px-3 py-2 rounded-lg text-sm text-emerald-400 hover:bg-slate-800 transition-colors"
            >
              + New Client
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
