"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { clearSession, getNama, getRole } from "@/lib/rbac";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const MENU = [
  { href: "/dashboard", label: "Dashboard Pemenangan", icon: "📊" },
  { href: "/dashboard/profil", label: "Profil Calon", icon: "👤" },
  { href: "/dashboard/pendukung", label: "Pendukung", icon: "👥" },
  { href: "/dashboard/relawan", label: "Relawan", icon: "🙋" },
  { href: "/dashboard/logistik", label: "Logistik", icon: "📦" },
  { href: "/dashboard/quickcount", label: "Perhitungan Calon", icon: "🗳️" },
  { href: "/dashboard/absensi", label: "Absensi Saksi", icon: "✅" },
  { href: "/dashboard/isu", label: "Manajemen Isu", icon: "📰" },
  { href: "/dashboard/monitoring", label: "Monitoring Wilayah", icon: "📍" },
  { href: "/dashboard/rekomendasi", label: "Rekomendasi Strategi", icon: "💡" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("relawan");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setNama(getNama());
    setRole(getRole());
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    clearSession();
    router.replace("/");
  }

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  }

  return (
    <>
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-blue-800 text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗳️</span>
          <span className="font-bold tracking-wide">SIMCALEG</span>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="text-2xl p-1">
          {open ? "✕" : "☰"}
        </button>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed z-50 top-0 left-0 h-full w-72 bg-blue-800 text-white flex flex-col transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-16 hidden lg:flex items-center gap-2 px-5 border-b border-blue-700/60">
          <span className="text-2xl">🗳️</span>
          <div>
            <p className="font-bold tracking-wide leading-none">SIMCALEG</p>
            <p className="text-[10px] text-blue-200 mt-1">Pemenangan Caleg</p>
          </div>
        </div>

        <div className="h-14 lg:hidden" />
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {MENU.map((item) => {
            const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white text-blue-900 shadow" : "text-blue-100 hover:bg-blue-700/60"}`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-blue-700/60 p-3 space-y-2">
          {installEvent && (
            <button onClick={handleInstall} className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2 transition">
              ⬇️ Install Aplikasi
            </button>
          )}
          <div className="rounded-lg bg-blue-900/60 px-3 py-2">
            <p className="text-xs text-blue-200">Masuk sebagai</p>
            <p className="text-sm font-semibold text-white truncate">{nama || "-"}</p>
            <span className="inline-block mt-1 text-[10px] uppercase rounded bg-blue-600 px-2 py-0.5 text-white">{role}</span>
          </div>
          <button onClick={handleLogout} className="w-full rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 transition">
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}