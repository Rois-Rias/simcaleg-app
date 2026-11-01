'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function Logistik() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nama_barang: '', jumlah: 0, lokasi: '' });

  const fetchData = async () => {
    const { data: res } = await supabase.from('logistik').select('*').order('created_at', { ascending: false });
    if (res) setData(res);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('logistik').insert([formData]);
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Logistik Kampanye</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">+ Tambah Barang</button>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr><th className="p-4">Nama Barang</th><th className="p-4">Jumlah</th><th className="p-4">Lokasi</th></tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{item.nama_barang}</td>
                <td className="p-4">{item.jumlah}</td>
                <td className="p-4">{item.lokasi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="font-bold mb-4">Tambah Logistik</h3>
            <form onSubmit={handleSimpan} className="space-y-3">
              <input required placeholder="Nama Barang" onChange={e => setFormData({...formData, nama_barang: e.target.value})} className="w-full border p-2 rounded" />
              <input required type="number" placeholder="Jumlah" onChange={e => setFormData({...formData, jumlah: Number(e.target.value)})} className="w-full border p-2 rounded" />
              <input placeholder="Lokasi" onChange={e => setFormData({...formData, lokasi: e.target.value})} className="w-full border p-2 rounded" />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}