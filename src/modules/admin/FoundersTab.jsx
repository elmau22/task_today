import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

const EMPTY = { name: '', position: '', bio: '', photo_url: '', email: '', linkedin_url: '', sort_order: 0 };

export default function FoundersTab() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => setItems(await api.get('/founders')), []);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault(); setError('');
    try {
      const body = { ...form };
      if (photo) body.photo_url = await api.upload(photo);
      if (editId) await api.put(`/founders/${editId}`, body);
      else await api.post('/founders', body);
      setForm(EMPTY); setPhoto(null); setEditId(null); load();
    } catch (err) { setError(err.message); }
  }
  async function remove(f) {
    if (!window.confirm(`Hapus ${f.name} dari halaman Pendiri?`)) return;
    await api.del(`/founders/${f.id}`, { reason: 'Dihapus dari dashboard' });
    load();
  }

  return (
    <div>
      <div className="panel p-4 p-md-5 mb-5">
        <h2 className="h3 mb-4">{editId ? 'Ubah Data Pendiri' : 'Tambah Pendiri'}</h2>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit} className="row g-3">
          <div className="col-md-6"><label className="form-label">Nama</label>
            <input className="form-control" required value={form.name} onChange={set('name')} /></div>
          <div className="col-md-6"><label className="form-label">Jabatan</label>
            <input className="form-control" value={form.position} onChange={set('position')} /></div>
          <div className="col-12"><label className="form-label">Profil singkat</label>
            <textarea className="form-control" rows={5} value={form.bio} onChange={set('bio')} /></div>
          <div className="col-md-4"><label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={set('email')} /></div>
          <div className="col-md-4"><label className="form-label">LinkedIn</label>
            <input className="form-control" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://" /></div>
          <div className="col-md-4"><label className="form-label">Urutan tampil</label>
            <input type="number" className="form-control" value={form.sort_order} onChange={set('sort_order')} /></div>
          <div className="col-12"><label className="form-label">Foto{form.photo_url && ' — sudah ada, unggah lagi untuk mengganti'}</label>
            <input type="file" accept="image/*" className="form-control" onChange={(e) => setPhoto(e.target.files[0] || null)} /></div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-ember">{editId ? 'Simpan' : 'Tambah'}</button>
            {editId && <button type="button" className="btn btn-mist" onClick={() => { setEditId(null); setForm(EMPTY); }}>Batal</button>}
          </div>
        </form>
      </div>
      <div className="panel p-4 p-md-5">
        <h3 className="h4 mb-4">Daftar Pendiri</h3>
        {items.length === 0 && <p className="text-muted mb-0">Belum ada data pendiri.</p>}
        {items.map((f) => (
          <div key={f.id} className="d-flex justify-content-between align-items-center border-top py-3 gap-3">
            <div><strong>{f.name}</strong> <span className="text-muted small">— {f.position}</span></div>
            <div className="text-nowrap">
              <button className="btn btn-quiet btn-sm" onClick={() => { setEditId(f.id); setForm({ ...EMPTY, ...f }); window.scrollTo({ top: 180, behavior: 'smooth' }); }}>Ubah</button>
              <button className="btn btn-danger-soft btn-sm" onClick={() => remove(f)}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
