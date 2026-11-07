"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "@/app/components/Modal";

type QuickCount = {
  id: number;
  tps: string;
  suara_caleg: number | null;
  suara_lawan: number | null;
  suara_tidak_sah: number | null;
  created_at: string;
};

type FormState = { tps: string; suara_caleg: string; suara_lawan: string; suara_tidak_sah: string };
const EMPTY: FormState = { tps: "", suara_caleg: "0", suara_lawan: "0", suara_tidak_sah: "0" };

export default function QuickCountPage() {
  const [rows, setRows] = useState<QuickCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from("quick_count").select("*").order("id", { ascending: false });
    if (err) setError(err.message);
    else setRows((data ?? []) as QuickCount[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    return rows.reduce((acc, r) => {
      acc.caleg += r.suara_caleg ?? 0;
      acc.lawan += r.suara_lawan ?? 0;
      acc.tidakSah += r.suara_tidak_sah ?? 0;
      return acc;
    }, { caleg: 0, lawan: 0, tidakSah: 0 });
  }, [rows]);

  const totalSah = totals.caleg + totals.lawan;
  const persen = totalSah > 0 ? (totals.caleg / totalSah) * 100 : 0;

  function openCreate() { setEditingId(null); setForm(EMPTY); setOpen(true); }
  function openEdit(row: QuickCount) {
    setEditingId(row.id);
    setForm({ tps: row.tps ?? "", suara_caleg: String(row.suara_caleg ?? 0), suara_lawan: String(row.suara_lawan ?? 0), suara_tidak_sah: String(row.suara_tidak_sah ?? 0) });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    const payload = { tps: form.tps.trim(), suara_caleg: Number(form.suara_caleg || 0), suara_lawan: Number(form.suara_lawan || 0), suara_tidak_sah: Number(form.suara_tidak_sah || 0) };
    if (!payload.tps) { setError("TPS wajib diisi."); setSaving(false); return; }
    const res = editingId ? await supabase.from("quick_count").update(payload).eq("id", editingId) : await supabase.from("quick_count").insert(payload);
    setSaving(false);
    if (res.error) { setError(res.error.message); return; }
    setOpen(false); await load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus data C1 TPS ini?")) return;
    const { error: err } = await supabase.from("quick_count").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Quick Count (C1)</h1>
          <p className="text-sm text-gray-500">Rekap perolehan suara per TPS dari formulir C1.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-4 py-2">+ Input Suara C1</button>
      </header>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs uppercase text-gray-500">Suara Caleg</p>
          <p className="text-2xl font-bold text-blue-800">{totals.caleg.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs uppercase text-gray-500">Suara Lawan</p>
          <p className="text-2xl font-bold text-red-600">{totals.lawan.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs uppercase text-gray-500">Tidak Sah</p>
          <p className="text-2xl font-bold text-gray-700">{totals.tidakSah.toLocaleString("id-ID")}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Persentase Suara Caleg</p>
          <span className="text-sm font-bold text-blue-800">{persen.toFixed(2)}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-blue-700 transition-all" style={{ width: `${Math.min(persen, 100)}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">No</th>
                <th className="px-4 py-3 text-left font-semibold">TPS</th>
                <th className="px-4 py-3 text-left font-semibold">Suara Caleg</th>
                <th className="px-4 py-3 text-left font-semibold">Suara Lawan</th>
                <th className="px-4 py-3 text-left font-semibold">Tidak Sah</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Memuat data…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Belum ada data quick count.</td></tr>
              : rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-blue-50/60">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{row.tps}</td>
                  <td className="px-4 py-3 font-semibold text-blue-800">{(row.suara_caleg ?? 0).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-red-600">{(row.suara_lawan ?? 0).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-gray-600">{(row.suara_tidak_sah ?? 0).toLocaleString("id-ID")}</td>
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

      <Modal open={open} title={editingId ? "Edit Data C1" : "Input Suara C1"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TPS <span className="text-red-500">*</span></label>
            <input required value={form.tps} onChange={(e) => setForm({ ...form, tps: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suara Caleg</label>
              <input type="number" min={0} value={form.suara_caleg} onChange={(e) => setForm({ ...form, suara_caleg: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suara Lawan</label>
              <input type="number" min={0} value={form.suara_lawan} onChange={(e) => setForm({ ...form, suara_lawan: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tidak Sah</label>
              <input type="number" min={0} value={form.suara_tidak_sah} onChange={(e) => setForm({ ...form, suara_tidak_sah: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none" />
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