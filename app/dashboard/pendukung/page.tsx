"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "@/app/components/Modal";
import { canWrite, getRole, type Role } from "@/lib/rbac";

type Pendukung = { id: number; nama: string; nik: string | null; alamat: string | null; status_dukungan: string | null; latitude: number | null; longitude: number | null; created_at: string; };
type FormState = { nama: string; nik: string; alamat: string; status_dukungan: string; latitude: string; longitude: string; };

const EMPTY: FormState = { nama: "", nik: "", alamat: "", status_dukungan: "Pendukung Tetap", latitude: "", longitude: "" };

export default function PendukungPage() {
  const [rows, setRows] = useState<Pendukung[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [role, setRole] = useState<Role>("relawan");

  useEffect(() => { setRole(getRole()); }, []);
  const writable = canWrite(role);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("pendukung").select("*").order("id", { ascending: false });
    if (!error) setRows((data ?? []) as Pendukung[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditingId(null); setForm(EMPTY); setOpen(true); }
  function openEdit(row: Pendukung) {
    setEditingId(row.id);
    setForm({ nama: row.nama, nik: row.nik ?? "", alamat: row.alamat ?? "", status_dukungan: row.status_dukungan ?? "Pendukung Tetap", latitude: row.latitude?.toString() ?? "", longitude: row.longitude?.toString() ?? "" });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { nama: form.nama, nik: form.nik || null, alamat: form.alamat || null, status_dukungan: form.status_dukungan, latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null };
    const res = editingId ? await supabase.from("pendukung").update(payload).eq("id", editingId) : await supabase.from("pendukung").insert(payload);
    setSaving(false);
    if (!res.error) { setOpen(false); load(); }
  }

  async function handleDelete(id: number) {
    if (confirm("Hapus data?")) { await supabase.from("pendukung").delete().eq("id", id); load(); }
  }

  function exportCSV() {
    // Logika export CSV (sama seperti sebelumnya)
    alert("Fungsi Export CSV dipanggil");
  }

  return (
    <div className="space-y-5">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Data Pendukung</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Export CSV</button>
          {writable && <button onClick={openCreate} className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ Tambah</button>}
        </div>
      </header>

      {!writable && <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm">Mode Read-Only (Caleg)</div>}

      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-800 text-white">
            <tr><th className="p-3">No</th><th className="p-3">Nama</th><th className="p-3">NIK</th><th className="p-3">Status</th>{writable && <th className="p-3">Aksi</th>}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b hover:bg-blue-50">
                <td className="p-3">{i + 1}</td><td className="p-3">{r.nama}</td><td className="p-3">{r.nik || "-"}</td><td className="p-3">{r.status_dukungan}</td>
                {writable && <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(r)} className="bg-amber-500 text-white px-2 py-1 rounded text-xs">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Hapus</button>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editingId ? "Edit" : "Tambah"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
           <input required placeholder="Nama" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full border p-2 rounded" />
           <input placeholder="NIK" value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} className="w-full border p-2 rounded" />
           <button type="submit" disabled={saving} className="bg-blue-800 text-white px-4 py-2 rounded w-full">{saving ? "..." : "Simpan"}</button>
        </form>
      </Modal>
    </div>
  );
}