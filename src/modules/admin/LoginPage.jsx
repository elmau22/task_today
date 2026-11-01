import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { user, ready, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', identity_number: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (ready && user) return <Navigate to={location.state?.from || '/dashboard'} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center py-3 py-md-5">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <h1 className="page-title fs-2 mb-2">{mode === 'login' ? 'Masuk' : 'Daftar akun mahasiswa'}</h1>
          <p className="text-muted mb-4">
            {mode === 'login'
              ? 'Masuk dengan email yang terdaftar. Dosen dan admin mendapat akun dari admin portal.'
              : 'Pendaftaran mandiri khusus mahasiswa.'}
          </p>
          <form className="panel p-4 p-md-5" onSubmit={submit}>
            {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
            {mode === 'register' && (
              <>
                <div className="mb-3">
                  <label className="form-label" htmlFor="name">Nama lengkap</label>
                  <input id="name" className="form-control" required value={form.name} onChange={set('name')} autoComplete="name" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="nim">NIM</label>
                  <input id="nim" className="form-control" value={form.identity_number} onChange={set('identity_number')} />
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="form-control" required value={form.email} onChange={set('email')} autoComplete="email" />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="password">Kata sandi</label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  value={form.password}
                  onChange={set('password')}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" className="btn btn-mist" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              {mode === 'register' && <div className="form-text">Minimal 8 karakter, memuat huruf dan angka.</div>}
            </div>
            <button type="submit" className="btn btn-ember w-100 py-2" disabled={busy}>
              {busy ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          </form>
          <p className="mt-3 small text-muted">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button type="button" className="btn btn-link p-0 align-baseline small" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Daftar sebagai mahasiswa' : 'Masuk'}
            </button>
            {' · '}<Link to="/">Kembali ke beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
