import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const EMPTY = {
  title: '', authors: '', abstract: '', keywords: '', category: '',
  year: new Date().getFullYear(), volume: '', issue: '', doi: '', file_url: '',
};
const STATUS = { pending: 'Menunggu tinjauan', published: 'Terbit', rejected: 'Ditolak' };

export default function JournalsTab() {
  const { user, isStaff } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...EMPTY, authors: user.name });
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setItems(await api.get(`/journals?scope=${isStaff ? 'review' : 'mine'}`));
  }, [isStaff]);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const body = { ...form };
      if (file) body.file_url = await api.upload(file);
      if (editId) await api.put(`/journals/${editId}`, body);
      else await api.post('/journals', body);
      setForm({ ...EMPTY, authors: user.name }); setFile(null); setEditId(null);
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  function edit(j) {
    setEditId(j.id);
    setForm({ ...EMPTY, ...j });
    window.scrollTo({ top: 180, behavior: 'smooth' });
  }

  async function review(j, status) {
    let review_note = '';
    if (status === 'rejected') {
      review_note = window.prompt('Catatan untuk penulis (alasan penolakan):') ?? null;
      if (review_note === null) return;
    }
    await api.patch(`/journals/${j.id}/status`, { status, review_note });
    load();
  }

  async function remove(j) {
    const reason = window.prompt(`Hapus jurnal "${j.title}"? Tulis alasannya:`);
    if (reason === null) return;
    await api.del(`/journals/${j.id}`, { reason });
    load();
  }

  return (
    <div>
      <div className="panel p-4 p-md-5 mb-5">
        <h2 className="h3 mb-1">{editId ? 'Ubah Naskah Jurnal' : 'Kirim Naskah Jurnal'}</h2>
        <p className="text-muted small mb-4">
          {isStaff
            ? 'Naskah dari dosen dan admin langsung terbit.'
            : 'Naskah mahasiswa ditinjau dosen atau admin sebelum tampil di halaman Jurnal.'}
        </p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Judul</label>
            <input className="form-control" required minLength={5} value={form.title} onChange={set('title')} />
          </div>
          <div className="col-md-8">
            <label className="form-label">Penulis (pisahkan dengan koma)</label>
            <input className="form-control" required value={form.authors} onChange={set('authors')} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Kategori</label>
            <input className="form-control" value={form.category} onChange={set('category')} placeholder="Mis. Rekayasa Perangkat Lunak" />
          </div>
          <div className="col-12">
            <label className="form-label">Abstrak</label>
            <textarea className="form-control" rows={5} value={form.abstract} onChange={set('abstract')} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Kata kunci</label>
            <input className="form-control" value={form.keywords} onChange={set('keywords')} placeholder="sdlc, analisis kebutuhan" />
          </div>
          <div className="col-md-6">
            <label className="form-label">DOI / tautan sumber (opsional)</label>
            <input className="form-control" value={form.doi} onChange={set('doi')} />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label">Tahun</label>
            <input type="number" className="form-control" value={form.year} onChange={set('year')} />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label">Volume</label>
            <input className="form-control" value={form.volume} onChange={set('volume')} />
          </div>
          <div className="col-4 col-md-2">
            <label className="form-label">Nomor</label>
            <input className="form-control" value={form.issue} onChange={set('issue')} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Berkas naskah (PDF){form.file_url && ' — sudah ada, unggah lagi untuk mengganti'}</label>
            <input type="file" accept=".pdf" className="form-control" onChange={(e) => setFile(e.target.files[0] || null)} />
          </div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-ember" disabled={busy}>{busy ? 'Menyimpan…' : editId ? 'Simpan Perubahan' : 'Kirim Naskah'}</button>
            {editId && (
              <button type="button" className="btn btn-mist" onClick={() => { setEditId(null); setForm({ ...EMPTY, authors: user.name }); }}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel p-4 p-md-5">
        <h3 className="h4 mb-4">{isStaff ? 'Semua naskah' : 'Naskah saya'}</h3>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Judul</th><th>Penulis</th><th>Status</th><th /></tr></thead>
            <tbody>
              {items.map((j) => (
                <tr key={j.id}>
                  <td className="fw-semibold">
                    {j.status === 'published' ? <Link to={`/jurnal/${j.id}`}>{j.title}</Link> : j.title}
                    {j.review_note && <div className="small text-muted fw-normal">Catatan: {j.review_note}</div>}
                  </td>
                  <td className="small">{j.authors}</td>
                  <td><span className="tag">{STATUS[j.status]}</span></td>
                  <td className="text-end text-nowrap">
                    {isStaff && j.status !== 'published' && (
                      <button className="btn btn-quiet btn-sm" onClick={() => review(j, 'published')}>Terbitkan</button>
                    )}
                    {isStaff && j.status === 'pending' && (
                      <button className="btn btn-quiet btn-sm" onClick={() => review(j, 'rejected')}>Tolak</button>
                    )}
                    {isStaff && j.status === 'published' && (
                      <button className="btn btn-quiet btn-sm" onClick={() => review(j, 'pending')}>Tarik</button>
                    )}
                    {(isStaff || j.status !== 'published') && (
                      <button className="btn btn-quiet btn-sm" onClick={() => edit(j)}>Ubah</button>
                    )}
                    {(isStaff || j.status !== 'published') && (
                      <button className="btn btn-danger-soft btn-sm" onClick={() => remove(j)}>Hapus</button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted py-4">Belum ada naskah.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
