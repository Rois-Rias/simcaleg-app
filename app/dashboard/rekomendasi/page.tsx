"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RekomendasiPage() {
  const [rekomendasi, setRekomendasi] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: pendukung } = await supabase.from("pendukung").select("status_dukungan");
      const { data: quickCount } = await supabase.from("quick_count").select("suara_caleg, suara_lawan");
      
      let saran: string[] = [];
      
      // Logika sederhana untuk demo
      const swingVoters = pendukung?.filter(p => p.status_dukungan === "Belum Menentukan").length || 0;
      if (swingVoters > 0) {
        saran.push(`Ada ${swingVoters} pemilih swing. Prioritaskan sosialisasi di wilayah tersebut.`);
      }

      const totalLawan = quickCount?.reduce((a, b) => a + (b.suara_lawan || 0), 0) || 0;
      if (totalLawan > 0) {
         saran.push("Perketat pengawasan di TPS dengan selisih suara tipis.");
      }

      if (saran.length === 0) {
        saran.push("Data belum cukup untuk memberikan rekomendasi strategis. Tambah data pendukung dan C1 terlebih dahulu.");
      }

      setRekomendasi(saran);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Menganalisis data...</div>;

  return (
    <div className="space-y-5 p-6">
      <h1 className="text-2xl font-bold text-blue-900">Rekomendasi Strategi</h1>
      <div className="grid gap-4">
        {rekomendasi.map((s, i) => (
          <div key={i} className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3">
            <span className="text-xl">💡</span>
            <p className="text-blue-900">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}