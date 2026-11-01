'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendukung: 0, relawan: 0, logistik: 0, suaraMasuk: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [resPendukung, resRelawan, resLogistik, resSuara] = await Promise.all([
        supabase.from('pendukung').select('*', { count: 'exact', head: true }),
        supabase.from('relawan').select('*', { count: 'exact', head: true }),
        supabase.from('logistik').select('*', { count: 'exact', head: true }),
        supabase.from('quick_count').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        pendukung: resPendukung.count || 0,
        relawan: resRelawan.count || 0,
        logistik: resLogistik.count || 0,
        suaraMasuk: resSuara.count || 0,
      });
      setIsLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Pemenangan</h2>
        <p className="text-gray-500 text-sm">Ringkasan data lapangan secara realtime.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Total Pendukung</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{isLoading ? '-' : stats.pendukung}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Relawan Aktif</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{isLoading ? '-' : stats.relawan}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Item Logistik</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{isLoading ? '-' : stats.logistik}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">TPS Sudah Input C1</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{isLoading ? '-' : stats.suaraMasuk}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[300px]">
        <h3 className="font-bold text-gray-800 mb-4">Peta Sebaran Pendukung (Segera Hadir)</h3>
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
          (Integrasi Peta Wilayah akan ditambahkan di fase berikutnya)
        </div>
      </div>
    </div>
  );
}