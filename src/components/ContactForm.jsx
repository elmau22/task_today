import React, { useState } from 'react';
import { api } from '../lib/api';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [state, setState] = useState({ busy: false, done: false, error: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, done: false, error: '' });
    try {
      await api.post('/contact', form);
      
      // Meneruskan juga via mailto ke info@lokalkreatif.com
      const subjectEncoded = encodeURIComponent(`[Task Today] ${form.subject || 'Kontak Pesan'} - Dari ${form.name}`);
      const bodyEncoded = encodeURIComponent(`Pengirim: ${form.name} (${form.email})\n\nPesan:\n${form.message}`);
      window.location.href = `mailto:info@lokalkreatif.com?subject=${subjectEncoded}&body=${bodyEncoded}`;

      setForm({ name: '', email: '', subject: '', message: '', website: '' });
      setState({ busy: false, done: true, error: '' });
    } catch (err) {
      setState({ busy: false, done: false, error: err.message });
    }
  }

  return (
    <form onSubmit={submit} className="panel p-4 p-md-5">
      {state.done && (
        <div className="notice mb-4" role="status">
          Pesan Anda telah berhasil disimpan di sistem dan diteruskan ke <strong>info@lokalkreatif.com</strong>.
        </div>
      )}
      {state.error && <div className="alert alert-danger py-2" role="alert">{state.error}</div>}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="c-name">Nama</label>
          <input id="c-name" className="form-control" required minLength={2} value={form.name} onChange={set('name')} autoComplete="name" />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="c-email">Email</label>
          <input id="c-email" type="email" className="form-control" required value={form.email} onChange={set('email')} autoComplete="email" />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="c-subject">Perihal</label>
          <input id="c-subject" className="form-control" value={form.subject} onChange={set('subject')} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="c-msg">Pesan</label>
          <textarea id="c-msg" className="form-control" rows={5} required minLength={10} value={form.message} onChange={set('message')} />
        </div>
        {/* Kolom jebakan untuk bot; disembunyikan dari pengguna */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')}
          style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
        <div className="col-12">
          <button className="btn btn-ember" disabled={state.busy}>{state.busy ? 'Mengirim…' : 'Kirim pesan'}</button>
        </div>
      </div>
    </form>
  );
}
