import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

const MAIL = { sent: 'Terkirim ke email', failed: 'Email gagal', skipped: 'Email belum dikonfigurasi', pending: 'Diproses' };

export default function MessagesTab() {
  const [items, setItems] = useState([]);
  const load = useCallback(async () => setItems(await api.get('/contact')), []);
  useEffect(() => { load().catch(() => {}); }, [load]);

  const toggle = async (m) => { await api.patch(`/contact/${m.id}`, { is_read: !m.is_read }); load(); };
  const remove = async (m) => {
    if (!window.confirm('Hapus pesan ini?')) return;
    await api.del(`/contact/${m.id}`); load();
  };

  return (
    <div className="panel p-4 p-md-5">
      <h2 className="h3 mb-4">Pesan dari Formulir Kontak</h2>
      {items.length === 0 && <p className="text-muted mb-0">Belum ada pesan.</p>}
      {items.map((m) => (
        <div key={m.id} className="border-top py-3">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div>
              <strong>{m.name}</strong> <a href={`mailto:${m.email}`} className="small">{m.email}</a>
              {!m.is_read && <span className="tag tag-ember ms-2">Baru</span>}
            </div>
            <div className="small text-muted">{new Date(m.created_at).toLocaleString('id-ID')} · {MAIL[m.mail_status]}</div>
          </div>
          {m.subject && <div className="fw-semibold mt-1">{m.subject}</div>}
          <p className="mb-2 mt-1" style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
          <button className="btn btn-quiet btn-sm" onClick={() => toggle(m)}>{m.is_read ? 'Tandai belum dibaca' : 'Tandai dibaca'}</button>
          <button className="btn btn-danger-soft btn-sm" onClick={() => remove(m)}>Hapus</button>
        </div>
      ))}
    </div>
  );
}
