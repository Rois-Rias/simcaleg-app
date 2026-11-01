'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function QuickCount() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ tps: '', suara_caleg: 0, suara_lawan: 0, suara_tidak_sah: 0 });

  const fetchData = async () => {
    const { data: res } = await supabase.from('quick_count').select('*').order('created_at', { ascending: false });
    if (res) setData(res);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('quick_count').insert([formData]);
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Input C1 / Quick Count</h2>
          <p className="text-gray-500 text-sm">Masukkan hasil perolehan suara dari Form C1.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">+ Input Suara TPS</button>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4">TPS</th><th className="p-4 text-blue-600">Suara Caleg</th><th className="p-4 text-red-600">Suara Lawan</th><th className="p-4">Suara Tidak Sah</th></tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{item.tps}</td>
                <td className="p-4 font-bold text-blue-600">{item.suara_caleg}</td>
                <td className="p-4 text-red-600">{item.suara_lawan}</td>
                <td className="p-4">{item.suara_tidak_sah}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="font-bold mb-4">Input C1 TPS</h3>
            <form onSubmit={handleSimpan} className="space-y-3">
              <input required placeholder="Nama / Nomor TPS" onChange={e => setFormData({...formData, tps: e.target.value})} className="w-full border p-2 rounded" />
              <label className="text-sm font-medium">Suara Caleg Anda</label>
              <input required type="number" onChange={e => setFormData({...formData, suara_caleg: Number(e.target.value)})} className="w-full border p-2 rounded" />
              <label className="text-sm font-medium">Suara Lawan Terdekat</label>
              <input required type="number" onChange={e => setFormData({...formData, suara_lawan: Number(e.target.value)})} className="w-full border p-2 rounded" />
              <label className="text-sm font-medium">Suara Tidak Sah</label>
              <input required type="number" onChange={e => setFormData({...formData, suara_tidak_sah: Number(e.target.value)})} className="w-full border p-2 rounded" />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}