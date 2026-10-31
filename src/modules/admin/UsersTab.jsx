import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth, ROLE_LABEL } from '../../context/AuthContext';

const EMPTY = { name: '', email: '', identity_number: '', role: 'dosen', password: '' };

export default function UsersTab() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = useCallback(async () => setUsers(await api.get('/users')), []);
  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e) {
    e.preventDefault(); setError('');
    try { await api.post('/users', form); setForm(EMPTY); load(); } catch (err) { setError(err.message); }
  }
  const patch = async (u, body) => {
    try { await api.patch(`/users/${u.id}`, body); load(); } catch (err) { alert(err.message); }
  };
  const resetPassword = (u) => {
    const password = window.prompt(`Kata sandi baru untuk ${u.name} (min. 8 karakter):`);
    if (password) patch(u, { password });
  };
  async function remove(u) {
    if (!window.confirm(`Hapus akun ${u.name}?`)) return;
    try { await api.del(`/users/${u.id}`); load(); } catch (err) { alert(err.message); }
  }

  return (
    <div>
      <div className="panel p-4 p-md-5 mb-5">
        <h2 className="h3 mb-1">Tambah Pengguna</h2>
        <p className="text-muted small mb-4">Mahasiswa dapat mendaftar sendiri. Akun dosen dan admin dibuat dari sini.</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={create} className="row g-3">
          <div className="col-md-4"><label className="form-label">Nama</label>
            <input className="form-control" required value={form.name} onChange={set('name')} /></div>
          <div className="col-md-4"><label className="form-label">Email</label>
            <input type="email" className="form-control" required value={form.email} onChange={set('email')} /></div>
          <div className="col-md-4"><label className="form-label">NIM / NIDN</label>
            <input className="form-control" value={form.identity_number} onChange={set('identity_number')} /></div>
          <div className="col-md-4"><label className="form-label">Peran</label>
            <select className="form-select" value={form.role} onChange={set('role')}>
              {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div className="col-md-4"><label className="form-label">Kata sandi awal</label>
            <input type="password" className="form-control" required minLength={8} value={form.password} onChange={set('password')} autoComplete="new-password" /></div>
          <div className="col-md-4 d-flex align-items-end"><button className="btn btn-ember">Buat Akun</button></div>
        </form>
      </div>

      <div className="panel p-4 p-md-5">
        <h3 className="h4 mb-4">Daftar Pengguna ({users.length})</h3>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">{u.name}<div className="small text-muted fw-normal">{u.identity_number}</div></td>
                  <td className="small">{u.email}</td>
                  <td>
                    <select className="form-select form-select-sm" value={u.role} disabled={u.id === me.id}
                      onChange={(e) => patch(u, { role: e.target.value })}>
                      {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td><span className="tag">{u.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-quiet btn-sm" onClick={() => resetPassword(u)}>Reset sandi</button>
                    {u.id !== me.id && (
                      <>
                        <button className="btn btn-quiet btn-sm" onClick={() => patch(u, { is_active: !u.is_active })}>
                          {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button className="btn btn-danger-soft btn-sm" onClick={() => remove(u)}>Hapus</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
