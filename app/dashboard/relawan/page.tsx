"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "@/app/components/Modal";

type Relawan = {
  id: number;
  nama: string;
  no_hp: string | null;
  role: string | null;
  wilayah: string | null;
  created_at: string;
};

type FormState = {
  nama: string;
  no_hp: string;
  role: string;
  wilayah: string;
};

const EMPTY: FormState = { nama: "", no_hp: "", role: "Relawan", wilayah: "" };

export default function RelawanPage() {
  const [rows, setRows] = useState<Relawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("relawan")
      .select("*")
      .order("id", { ascending: false });
    if (err) setError(err.message);
    else setRows((data ?? []) as Relawan[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(row: Relawan) {
    setEditingId(row.id);
    setForm({
      nama: row.nama ?? "",
      no_hp: row.no_hp ?? "",
      role: row.role ?? "Relawan",
      wilayah: row.wilayah ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      nama: form.nama.trim(),
      no_hp: form.no_hp.trim() || null,
      role: form.role || null,
      wilayah: form.wilayah.trim() || null,
    };

    const res = editingId
      ? await supabase.from("relawan").update(payload).eq("id", editingId)
      : await supabase.from("relawan").insert(payload);

    setSaving(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    setOpen(false);
    await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus data relawan ini?")) return;
    const { error: err } = await supabase.from("relawan").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Data Relawan</h1>
          <p className="text-sm text-gray-500">Kelola tim relawan, saksi, dan wilayah kerja.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-4 py-2">
          + Tambah Relawan
        </button>
      </header>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">No. HP</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Wilayah</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Memuat data…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Belum ada data relawan.</td></tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-blue-50/60">
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{row.no_hp ?? "-"}</td>
                    <td className="px-4 py-3"><span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1">{row.role ?? "-"}</span></td>
                    <td className="px-4 py-3 text-gray-600">{row.wilayah ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(row)} className="rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5">Edit</button>
                        <button onClick={() => handleDelete(row.id)} className="rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} title={editingId ? "Edit Relawan" : "Tambah Relawan"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
            <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
              <input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none">
                <option value="Koordinator">Koordinator</option>
                <option value="Relawan">Relawan</option>
                <option value="Saksi">Saksi</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
            <input value={form.wilayah} onChange={(e) => setForm({ ...form, wilayah: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
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