'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TimRelawan() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nama: '', no_hp: '', role: 'Kordes', wilayah: '' });

  const fetchData = async () => {
    const { data: res } = await supabase.from('relawan').select('*').order('created_at', { ascending: false });
    if (res) setData(res);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('relawan').insert([formData]);
    setIsModalOpen(false);
    setFormData({ nama: '', no_hp: '', role: 'Kordes', wilayah: '' });
    fetchData();
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tim Relawan</h2>
          <p className="text-gray-500 text-sm">Manajemen struktur tim pemenangan.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">+ Tambah Relawan</button>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Nama</th>
              <th className="p-4">No. HP</th>
              <th className="p-4">Role</th>
              <th className="p-4">Wilayah</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{item.nama}</td>
                <td className="p-4 text-gray-600">{item.no_hp}</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{item.role}</span></td>
                <td className="p-4 text-gray-600">{item.wilayah}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="font-bold text-lg mb-4">Tambah Relawan</h3>
            <form onSubmit={handleSimpan} className="space-y-3">
              <input required placeholder="Nama Lengkap" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full border p-2 rounded" />
              <input placeholder="No HP" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} className="w-full border p-2 rounded" />
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border p-2 rounded">
                <option value="Korcam">Korcam</option>
                <option value="Kordes">Kordes</option>
                <option value="Kor TPS">Kor TPS</option>
              </select>
              <input placeholder="Wilayah Tugas" value={formData.wilayah} onChange={e => setFormData({...formData, wilayah: e.target.value})} className="w-full border p-2 rounded" />
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