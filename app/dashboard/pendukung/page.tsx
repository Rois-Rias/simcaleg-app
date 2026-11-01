'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function DataPendukung() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState('relawan');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ nama: '', nik: '', alamat: '', status_dukungan: 'Pendukung Kuat' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendukung = async () => {
    setIsLoading(true);
    const { data: pendukungData, error } = await supabase
      .from('pendukung')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && pendukungData) {
      setData(pendukungData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const userRole = localStorage.getItem('role') || 'relawan';
    setRole(userRole);
    fetchPendukung();
  }, []);

  const exportToCSV = () => {
    if (data.length === 0) return alert('Tidak ada data untuk diekspor');
    const headers = ['Nama', 'NIK', 'Alamat', 'Status Dukungan'];
    const rows = data.map((item) => [
      `"${item.nama}"`, 
      `"${item.nik || ''}"`, 
      `"${item.alamat || ''}"`, 
      `"${item.status_dukungan}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Data_Pendukung_${new Date().toLocaleDateString('id-ID')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBukaTambah = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ nama: '', nik: '', alamat: '', status_dukungan: 'Pendukung Kuat' });
    setIsModalOpen(true);
  };

  const handleBukaEdit = (item: any) => {
    setIsEditMode(true);
    setEditId(item.id);
    setFormData({ 
      nama: item.nama, 
      nik: item.nik || '', 
      alamat: item.alamat || '', 
      status_dukungan: item.status_dukungan 
    });
    setIsModalOpen(true);
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let error;

    if (isEditMode && editId) {
      const { error: updateError } = await supabase
        .from('pendukung')
        .update(formData)
        .eq('id', editId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('pendukung')
        .insert([formData]);
      error = insertError;
    }

    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      setIsModalOpen(false);
      fetchPendukung();
    }
    setIsSubmitting(false);
  };

  const handleHapus = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const { error } = await supabase.from('pendukung').delete().eq('id', id);
      if (error) alert('Gagal menghapus: ' + error.message);
      else fetchPendukung();
    }
  };

  return (
    <div>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Pendukung</h2>
          <p className="text-gray-500 text-sm">Daftar warga yang telah didata oleh tim relawan.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 shadow-sm">
            Export CSV
          </button>
          
          {/* Cek RBAC: Jika Caleg, tombol tambah hilang */}
          {role !== 'caleg' && (
            <button onClick={handleBukaTambah} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm">
              + Tambah Pendukung
            </button>
          )}
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">NIK</th>
                <th className="p-4 font-semibold">Alamat</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada data pendukung.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{item.nama}</td>
                    <td className="p-4 text-gray-600">{item.nik || '-'}</td>
                    <td className="p-4 text-gray-600">{item.alamat || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status_dukungan === 'Pendukung Kuat' ? 'bg-green-100 text-green-700' 
                        : item.status_dukungan === 'Ragu-ragu' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status_dukungan}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      {/* Cek RBAC: Jika Caleg, tombol edit & hapus hilang */}
                      {role !== 'caleg' && (
                        <>
                          <button onClick={() => handleBukaEdit(item)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium transition">
                            Edit
                          </button>
                          <button onClick={() => handleHapus(item.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium transition">
                            Hapus
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isEditMode ? 'Edit Data Pendukung' : 'Tambah Pendukung Baru'}
            </h3>
            
            <form onSubmit={handleSimpan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input required type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK (Opsional)</label>
                <input type="text" value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat / RT RW</label>
                <input type="text" value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Dukungan</label>
                <select value={formData.status_dukungan} onChange={(e) => setFormData({...formData, status_dukungan: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="Pendukung Kuat">Pendukung Kuat</option>
                  <option value="Ragu-ragu">Ragu-ragu</option>
                  <option value="Oposisi">Oposisi</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                  {isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Update Data' : 'Simpan Data')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}