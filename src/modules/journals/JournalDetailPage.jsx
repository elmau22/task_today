import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

export default function JournalDetailPage() {
  const { id } = useParams();
  const [j, setJ] = useState(undefined);
  useEffect(() => { api.get(`/journals/${id}`).then(setJ).catch(() => setJ(null)); }, [id]);

  if (j === undefined) return <div className="container py-5 text-muted">Memuat…</div>;
  if (j === null) return (
    <div className="container py-5">
      <p>Jurnal tidak ditemukan.</p><Link to="/jurnal">Kembali ke daftar jurnal</Link>
    </div>
  );

  const keywords = j.keywords ? j.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [];
  const doiHref = j.doi && (j.doi.startsWith('http') ? j.doi : `https://doi.org/${j.doi}`);

  return (
    <div className="container pb-5" style={{ maxWidth: 820 }}>
      <p className="pt-4 small"><Link to="/jurnal">← Semua jurnal</Link></p>
      <p className="small text-muted mb-2">
        {[j.category, j.year, j.volume && `Vol. ${j.volume}`, j.issue && `No. ${j.issue}`].filter(Boolean).join(' · ')}
      </p>
      <h1 className="page-title mb-2">{j.title}</h1>
      <p className="mb-4">{j.authors}</p>

      {j.status !== 'published' && <div className="notice mb-4">Naskah ini belum terbit (status: {j.status}).</div>}

      {j.abstract && (<><h2 className="h5">Abstrak</h2><p style={{ whiteSpace: 'pre-line' }}>{j.abstract}</p></>)}
      {keywords.length > 0 && <p className="small"><strong>Kata kunci:</strong> {keywords.join(', ')}</p>}

      <div className="d-flex gap-2 flex-wrap mt-4">
        {j.file_url && <a className="btn btn-ember" href={j.file_url} target="_blank" rel="noreferrer noopener">Unduh PDF</a>}
        {doiHref && <a className="btn btn-mist" href={doiHref} target="_blank" rel="noreferrer noopener">DOI / sumber</a>}
      </div>
      {j.file_url && j.file_url.toLowerCase().endsWith('.pdf') && (
        <iframe title="Pratinjau naskah" src={j.file_url} className="journal-frame mt-4" />
      )}
    </div>
  );
}
