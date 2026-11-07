"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "@/app/components/Modal";

type Isu = {
  id: number;
  judul_isu: string;
  deskripsi: string | null;
  status: string | null;
  created_at: string;
};

type FormState = { judul_isu: string; deskripsi: string; status: string };
const EMPTY: FormState = { judul_isu: "", deskripsi: "", status: "Aktif" };

export default function IsuPage() {
  const [rows, setRows] = useState<Isu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("manajemen_isu").select("*").order("id", { ascending: false });
    if (err) setError(err.message);
    else setRows((data ?? []) as Isu[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditingId(null); setForm(EMPTY); setOpen(true); }
  function openEdit(row: Isu) {
    setEditingId(row.id);
    setForm({ judul_isu: row.judul_isu ?? "", deskripsi: row.deskripsi ?? "", status: row.status ?? "Aktif" });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = { judul_isu: form.judul_isu.trim(), deskripsi: form.deskripsi.trim() || null, status: form.status };
    const res = editingId ? await supabase.from("manajemen_isu").update(payload).eq("id", editingId) : await supabase.from("manajemen_isu").insert(payload);
    setSaving(false);
    if (res.error) { setError(res.error.message); return; }
    setOpen(false); await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus data isu ini?")) return;
    const { error: err } = await supabase.from("manajemen_isu").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Manajemen Isu</h1>
          <p className="text-sm text-gray-500">Catat dan pantau isu strategis maupun isu negatif di lapangan.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-4 py-2">+ Tambah Isu</button>
      </header>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">Judul Isu</th>
                <th className="px-4 py-3 text-left font-semibold">Deskripsi</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Memuat data…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Belum ada data isu.</td></tr>
              : rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-blue-50/60">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.judul_isu}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{row.deskripsi ?? "-"}</td>
                  <td className="px-4 py-3">
                     <span className={`inline-block rounded-full text-xs px-2.5 py-1 ${row.status === 'Aktif' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {row.status}
                     </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(row)} className="rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5">Edit</button>
                      <button onClick={() => handleDelete(row.id)} className="rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title={editingId ? "Edit Isu" : "Tambah Isu"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Isu <span className="text-red-500">*</span></label>
            <input required value={form.judul_isu} onChange={(e) => setForm({ ...form, judul_isu: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Contoh: Isu sembako murah" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Detail isu, sumber, dan dampaknya..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none">
              <option value="Aktif">Aktif (Perlu Penanganan)</option>
              <option value="Selesai">Selesai / Teratasi</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2">{saving ? "Menyimpan…" : "Simpan"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}