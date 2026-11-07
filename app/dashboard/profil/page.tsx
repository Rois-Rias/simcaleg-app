"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilCalonPage() {
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profil_caleg").select("*").limit(1).maybeSingle()
      .then(({ data }) => { if (data) setProfil(data); setLoading(false); });
  }, []);

  if (loading) return <div>Memuat profil...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Profil Calon Legislatif</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
          <p className="font-semibold text-gray-900">{profil.nama_caleg || "-"}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-gray-500">Partai</label><p className="font-medium">{profil.partai || "-"}</p></div>
          <div><label className="text-sm text-gray-500">Dapil</label><p className="font-medium">{profil.dapil || "-"}</p></div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Visi</label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{profil.visi || "Belum ada visi."}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Misi</label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{profil.misi || "Belum ada misi."}</p>
        </div>
      </div>
    </div>
  );
}