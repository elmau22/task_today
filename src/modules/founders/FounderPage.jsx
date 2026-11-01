import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function FounderPage() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.get('/founders').then(setItems).catch(() => setItems([])); }, []);

  return (
    <div className="container pb-5">
      <header className="page-head">
        <h1 className="page-title">Pendiri</h1>
        <p className="section-lead">Orang-orang di balik Task Today.</p>
      </header>

      {items === null && <p className="text-muted">Memuat…</p>}
      {items && items.length === 0 && (
        <div className="panel p-4 text-muted">Profil pendiri belum diisi. Admin dapat menambahkannya dari dashboard.</div>
      )}

      <div className="d-flex flex-column gap-5">
        {items?.map((f, i) => (
          <article key={f.id} className={`row g-4 align-items-start ${i % 2 ? 'flex-lg-row-reverse' : ''}`}>
            <div className="col-md-4 col-lg-3">
              {f.photo_url ? (
                <img src={f.photo_url} alt={f.name} className="founder-photo" loading="lazy" />
              ) : (
                <div className="founder-photo founder-photo-empty" aria-hidden="true">{f.name.charAt(0)}</div>
              )}
            </div>
            <div className="col-md-8 col-lg-9">
              <h2 className="h3 mb-1">{f.name}</h2>
              {f.position && <p className="text-muted mb-3">{f.position}</p>}
              {f.bio && <p style={{ whiteSpace: 'pre-line', maxWidth: '65ch' }}>{f.bio}</p>}
              <p className="small mb-0 d-flex gap-3">
                {f.email && <a href={`mailto:${f.email}`}>{f.email}</a>}
                {f.linkedin_url && <a href={f.linkedin_url} target="_blank" rel="noreferrer noopener">LinkedIn</a>}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
