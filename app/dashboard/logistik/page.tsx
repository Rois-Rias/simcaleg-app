"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "@/app/components/Modal";

type Logistik = {
  id: number;
  nama_barang: string;
  jumlah: number | null;
  lokasi: string | null;
  created_at: string;
};

type FormState = { nama_barang: string; jumlah: string; lokasi: string };
const EMPTY: FormState = { nama_barang: "", jumlah: "", lokasi: "" };

export default function LogistikPage() {
  const [rows, setRows] = useState<Logistik[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("logistik").select("*").order("id", { ascending: false });
    if (err) setError(err.message);
    else setRows((data ?? []) as Logistik[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditingId(null); setForm(EMPTY); setOpen(true); }
  function openEdit(row: Logistik) {
    setEditingId(row.id);
    setForm({ nama_barang: row.nama_barang ?? "", jumlah: row.jumlah != null ? String(row.jumlah) : "", lokasi: row.lokasi ?? "" });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = { nama_barang: form.nama_barang.trim(), jumlah: form.jumlah !== "" ? Number(form.jumlah) : null, lokasi: form.lokasi.trim() || null };
    const res = editingId ? await supabase.from("logistik").update(payload).eq("id", editingId) : await supabase.from("logistik").insert(payload);
    setSaving(false);
    if (res.error) { setError(res.error.message); return; }
    setOpen(false); await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus data logistik ini?")) return;
    const { error: err } = await supabase.from("logistik").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const totalItem = rows.reduce((acc, r) => acc + (r.jumlah ?? 0), 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Data Logistik</h1>
          <p className="text-sm text-gray-500">Total item logistik tercatat: <b className="text-blue-800">{totalItem.toLocaleString("id-ID")}</b></p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-4 py-2">+ Tambah Logistik</button>
      </header>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">Nama Barang</th>
                <th className="px-4 py-3 text-left font-semibold">Jumlah</th>
                <th className="px-4 py-3 text-left font-semibold">Lokasi</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Memuat data…</td></tr> 
              : rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Belum ada data logistik.</td></tr>
              : rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-blue-50/60">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.nama_barang}</td>
                  <td className="px-4 py-3"><span className="inline-block rounded-full bg-amber-100 text-amber-800 text-xs px-2.5 py-1">{(row.jumlah ?? 0).toLocaleString("id-ID")}</span></td>
                  <td className="px-4 py-3 text-gray-600">{row.lokasi ?? "-"}</td>
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

      <Modal open={open} title={editingId ? "Edit Logistik" : "Tambah Logistik"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang <span className="text-red-500">*</span></label>
            <input required value={form.nama_barang} onChange={(e) => setForm({ ...form, nama_barang: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
              <input type="number" min={0} value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
              <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Posko / Gudang" />
            </div>
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