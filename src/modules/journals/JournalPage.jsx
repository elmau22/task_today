import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function JournalPage() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => { api.get('/journals').then(setItems).catch(() => setItems([])); }, []);

  const years = useMemo(() => [...new Set((items || []).map((j) => j.year).filter(Boolean))].sort((a, b) => b - a), [items]);
  const shown = (items || []).filter((j) => {
    const hay = `${j.title} ${j.authors} ${j.keywords} ${j.category}`.toLowerCase();
    return hay.includes(q.toLowerCase()) && (!year || String(j.year) === year);
  });

  return (
    <div className="container pb-5">
      <header className="page-head">
        <h1 className="page-title">Publikasi Jurnal</h1>
        <p className="section-lead">
          Naskah ilmiah dari dosen dan mahasiswa yang sudah ditinjau.{' '}
          <Link to={user ? '/dashboard' : '/login'}>{user ? 'Kirim naskah dari dashboard' : 'Masuk untuk mengirim naskah'}</Link>.
        </p>
      </header>

      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <input className="form-control" placeholder="Cari judul, penulis, atau kata kunci" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Semua tahun</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {items === null && <p className="text-muted">Memuat…</p>}
      {items && shown.length === 0 && <p className="text-muted">Belum ada jurnal yang cocok.</p>}

      <ol className="journal-list">
        {shown.map((j) => (
          <li key={j.id} className="journal-item">
            <div className="small text-muted">
              {[j.category, j.year, j.volume && `Vol. ${j.volume}`, j.issue && `No. ${j.issue}`].filter(Boolean).join(' · ')}
            </div>
            <h2 className="h5 mb-1"><Link to={`/jurnal/${j.id}`}>{j.title}</Link></h2>
            <div className="small mb-2">{j.authors}</div>
            {j.abstract && <p className="text-muted small mb-0 clamp-2">{j.abstract}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
