"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import type { MapPoint } from "@/app/components/MapView";

const MapView = dynamic(() => import("@/app/components/MapView"), { ssr: false });

type Stats = {
  pendukung: number;
  relawan: number;
  logistik: number;
  suara_c1: number;
  target_suara: number;
  profil: any;
};

type PendukungRow = {
  id: number; nama: string; alamat: string | null; status_dukungan: string | null;
  latitude: number | null; longitude: number | null;
};

function rand(seed: number) { return Math.sin(seed * 9301 + 49297) * 233280 % 1; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ pendukung: 0, relawan: 0, logistik: 0, suara_c1: 0, target_suara: 0, profil: {} });
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pCount, rCount, lCount, qCount, profilData, mapRows] = await Promise.all([
        supabase.from("pendukung").select("*", { count: "exact", head: true }),
        supabase.from("relawan").select("*", { count: "exact", head: true }),
        supabase.from("logistik").select("*", { count: "exact", head: true }),
        supabase.from("quick_count").select("suara_caleg"),
        supabase.from("profil_caleg").select("*").limit(1).maybeSingle(),
        supabase.from("pendukung").select("id, nama, alamat, status_dukungan, latitude, longitude").limit(500),
      ]);

      const suaraC1 = (qCount.data ?? []).reduce((acc, curr) => acc + (curr.suara_caleg ?? 0), 0);
      
      setStats({
        pendukung: pCount.count ?? 0,
        relawan: rCount.count ?? 0,
        logistik: lCount.count ?? 0,
        suara_c1: suaraC1,
        target_suara: profilData.data?.target_suara ?? 0,
        profil: profilData.data ?? {}
      });

      const rows = (mapRows.data ?? []) as PendukungRow[];
      setPoints(rows.map(r => {
        const hasCoord = r.latitude !== null && r.longitude !== null;
        return {
          id: r.id, nama: r.nama, alamat: r.alamat, status: r.status_dukungan,
          lat: hasCoord ? r.latitude! : -6.9147 + rand(r.id) * 0.05,
          lng: hasCoord ? r.longitude! : 107.6098 + rand(r.id) * 0.05,
          dummy: !hasCoord
        };
      }));
      setLoading(false);
    })();
  }, []);

  const persenTarget = stats.target_suara > 0 ? (stats.suara_c1 / stats.target_suara) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Profil Caleg & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">👤</div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-blue-900">{stats.profil?.nama_caleg || "Nama Caleg Belum Diatur"}</h2>
            <p className="text-sm text-gray-500">{stats.profil?.partai || "Partai"} - {stats.profil?.dapil || "Dapil"}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
               <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Edit Profil</button>
               <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-semibold">Edit Target</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Progres Pemenangan</h3>
          <div className="relative w-32 h-32 mx-auto rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#1d4ed8 ${persenTarget}%, #e5e7eb 0)` }}>
             <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{persenTarget.toFixed(0)}%</span>
                <span className="text-xs text-gray-500">tercapai</span>
             </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">Target: {stats.target_suara.toLocaleString()} Suara</p>
        </div>
      </div>

      {/* Grid Statistik Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pendukung", value: stats.pendukung, icon: "👥", color: "bg-blue-100 text-blue-800" },
          { label: "Total Relawan", value: stats.relawan, icon: "🙋", color: "bg-emerald-100 text-emerald-800" },
          { label: "Logistik Tercatat", value: stats.logistik, icon: "📦", color: "bg-amber-100 text-amber-800" },
          { label: "Suara Masuk (C1)", value: stats.suara_c1, icon: "🗳️", color: "bg-purple-100 text-purple-800" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-lg font-bold text-gray-800">{loading ? "..." : s.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Peta Monitoring */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold text-blue-900 mb-4">Peta Sebaran Pendukung</h3>
        {!loading && <MapView points={points} />}
      </div>
    </div>
  );
}