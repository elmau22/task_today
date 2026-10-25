import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import Reveal from '../../components/effects/Reveal';

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  async function loadArticle() {
    setLoading(true);
    setErrorMsg('');

    try {
      const [currentBlog, list] = await Promise.all([
        blogService.getById(id),
        blogService.getAll(),
      ]);

      if (!currentBlog) {
        throw new Error('Artikel blog tidak ditemukan atau telah dihapus.');
      }

      setBlog(currentBlog);
      setAllBlogs(list || []);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat artikel blog.');
    } finally {
      setLoading(false);
    }
  }

  const copyArticleLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    });
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <span className="eyebrow mb-3">Memuat Artikel</span>
        <h2 className="section-title mt-2">Menyiapkan Bacaan Blog...</h2>
        <p className="text-muted">Memuat konten wawasan perkuliahan dan analisis sistem.</p>
      </div>
    );
  }

  if (errorMsg || !blog) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="panel p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <span className="eyebrow mb-3 text-danger border-danger">Pemberitahuan</span>
          <h2 className="h3 mb-3">{errorMsg || 'Artikel Tidak Ditemukan'}</h2>
          <p className="text-muted mb-4">
            Artikel yang Anda cari mungkin telah dipindahkan atau tautan yang Anda tuju kurang tepat.
          </p>
          <Link to="/blog" className="btn btn-ember">
            Kembali ke Katalog Blog
          </Link>
        </div>
      </div>
    );
  }

  // Cari artikel sebelumnya dan sesudahnya untuk navigasi
  const currentIndex = allBlogs.findIndex((b) => String(b.id) === String(blog.id));
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
  const nextBlog =
    currentIndex !== -1 && currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null;

  // Rekomendasi artikel terkait (kategori sama atau artikel lain)
  const relatedBlogs = allBlogs
    .filter((b) => String(b.id) !== String(blog.id))
    .slice(0, 3);

  return (
    <div className="container py-4 pb-5">
      {/* ================= BILAH NAVIGASI ATAS & AKSI ================= */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link to="/" className="text-link small">
            Beranda
          </Link>
          <span className="text-muted small">/</span>
          <Link to="/blog" className="text-link small">
            Blog &amp; Wawasan
          </Link>
          <span className="text-muted small">/</span>
          <span className="tag tag-ember" style={{ fontSize: '0.74rem' }}>
            {blog.category || 'Artikel'}
          </span>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={copyArticleLink}
            title="Salin tautan artikel ini ke clipboard"
          >
            {copiedLink ? 'Tautan Disalin!' : 'Bagikan Artikel'}
          </button>

          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => window.print()}
            title="Cetak atau simpan artikel ini ke PDF bersih"
          >
            Cetak Artikel (PDF)
          </button>

          <Link to="/blog" className="btn btn-ember btn-sm">
            ← Semua Artikel
          </Link>
        </div>
      </div>

      <div className="row g-4 justify-content-center">
        {/* ================= KOLOM UTAMA ARTIKEL ================= */}
        <main className="col-12 col-lg-9 col-xl-8">
          <article className="panel p-4 p-md-5 bg-white mb-5">
            {/* Header Artikel */}
            <header className="mb-4 pb-3 border-bottom">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="tag tag-ember">{blog.category || 'Artikel Ilmiah'}</span>
                <span className="small text-muted">•</span>
                <span className="small text-muted">{blog.read_time || '4 menit baca'}</span>
                <span className="small text-muted">•</span>
                <span className="small text-muted">Dipublikasikan: {blog.date}</span>
              </div>

              <h1
                className="h2 font-display fw-bold text-navy mb-3"
                style={{ lineHeight: 1.3, letterSpacing: '0.01em' }}
              >
                {blog.title}
              </h1>

              {/* Kartu Penulis */}
              <div className="d-flex align-items-center gap-3 pt-2">
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--navy)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    border: '2px solid var(--paper)',
                    boxShadow: '2px 2px 0 var(--navy)',
                  }}
                >
                  {((blog.author || 'M')[0]).toUpperCase()}
                </div>
                <div>
                  <div className="fw-bold text-navy small">
                    {blog.author || 'Mohamad Farael Maulana'}
                  </div>
                  <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                    Kontributor Portal · S1 Teknik Informatika UMC
                  </div>
                </div>
              </div>
            </header>

            {/* Gambar Sampul Unggulan (Cover Image) */}
            {blog.cover_url && (
              <figure className="mb-4 p-2 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <img
                  src={blog.cover_url}
                  alt={blog.title}
                  className="img-fluid rounded w-100 shadow-sm"
                  style={{
                    maxHeight: '440px',
                    objectFit: 'cover',
                  }}
                />
              </figure>
            )}

            {/* Kotak Ringkasan Inti Artikel (Summary Lead) */}
            {blog.summary && (
              <div
                className="p-3 p-md-4 mb-4 rounded"
                style={{
                  background: '#fcfaf0',
                  borderLeft: '5px solid var(--ember)',
                  borderTop: '1px solid rgba(20,40,63,0.12)',
                  borderRight: '1px solid rgba(20,40,63,0.12)',
                  borderBottom: '1px solid rgba(20,40,63,0.12)',
                  fontSize: '1.05rem',
                  lineHeight: 1.75,
                  fontStyle: 'italic',
                  color: 'var(--navy)',
                }}
              >
                <strong>Inti Pembahasan:</strong> {blog.summary}
              </div>
            )}

            {/* Isi Lengkap Artikel Blog */}
            <div
              className="blog-full-content"
              style={{
                lineHeight: 1.9,
                fontSize: '1.08rem',
                color: 'var(--text)',
              }}
            >
              {blog.content.split('\n\n').map((paragraph, pIdx) => {
                const trimmed = paragraph.trim();

                // Format list bernomor
                if (/^\d+\.\s/.test(trimmed)) {
                  const listItems = trimmed.split('\n').filter((l) => l.trim());
                  return (
                    <ol key={pIdx} className="mb-4 ps-4" style={{ lineHeight: 1.85 }}>
                      {listItems.map((item, lIdx) => (
                        <li key={lIdx} className="mb-2">
                          {item.replace(/^\d+\.\s*/, '')}
                        </li>
                      ))}
                    </ol>
                  );
                }

                // Format bullet points
                if (/^[-•*]\s/.test(trimmed)) {
                  const bulletItems = trimmed.split('\n').filter((l) => l.trim());
                  return (
                    <ul key={pIdx} className="mb-4 ps-4" style={{ lineHeight: 1.85 }}>
                      {bulletItems.map((item, bIdx) => (
                        <li key={bIdx} className="mb-2">
                          {item.replace(/^[-•*]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={pIdx} className="mb-4" style={{ whiteSpace: 'pre-line' }}>
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Catatan Kaki Penulis & Identitas Perkuliahan */}
            <div
              className="mt-5 p-4 rounded d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3"
              style={{
                background: 'var(--paper)',
                border: '2px solid var(--navy)',
                boxShadow: '3px 3px 0 var(--navy)',
              }}
            >
              <div>
                <span className="eyebrow mb-1" style={{ fontSize: '0.72rem' }}>
                  Wawasan Perkuliahan
                </span>
                <h4 className="h6 fw-bold text-navy mb-1">
                  Analisis &amp; Desain Sistem Informasi
                </h4>
                <p className="small text-muted mb-0">
                  Program Studi S1 Teknik Informatika · Fakultas Teknik · Universitas Muhammadiyah Cirebon
                </p>
              </div>

              <button
                type="button"
                className="btn btn-quiet btn-sm text-nowrap"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Kembali ke Atas ↑
              </button>
            </div>
          </article>

          {/* ================= NAVIGASI SEBELUMNYA & SELANJUTNYA ================= */}
          <div className="panel p-3 p-md-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-5">
            <div>
              {prevBlog ? (
                <button
                  type="button"
                  className="btn btn-mist btn-sm"
                  onClick={() => navigate(`/blog/${prevBlog.id}`)}
                >
                  ← {prevBlog.title.substring(0, 26)}...
                </button>
              ) : (
                <span className="small text-muted">Awal arsip blog.</span>
              )}
            </div>

            <Link to="/blog" className="btn btn-quiet btn-sm">
              Katalog Semua Artikel
            </Link>

            <div>
              {nextBlog ? (
                <button
                  type="button"
                  className="btn btn-mist btn-sm"
                  onClick={() => navigate(`/blog/${nextBlog.id}`)}
                >
                  {nextBlog.title.substring(0, 26)}... →
                </button>
              ) : (
                <span className="small text-muted">Akhir arsip blog.</span>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ================= REKOMENDASI ARTIKEL TERKAIT ================= */}
      {relatedBlogs.length > 0 && (
        <section className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <span className="eyebrow mb-1">Eksplorasi Wawasan</span>
              <h3 className="h5 fw-bold text-navy mb-0">Artikel Blog Lainnya</h3>
            </div>
            <Link to="/blog" className="text-link small">
              Lihat Seluruh Artikel →
            </Link>
          </div>

          <div className="row g-4">
            {relatedBlogs.map((rel, rIdx) => (
              <div key={rel.id} className="col-12 col-md-4">
                <div
                  className="card card-nature h-100 p-3 clickable d-flex flex-column"
                  onClick={() => navigate(`/blog/${rel.id}`)}
                >
                  {rel.cover_url && (
                    <div className="card-media mb-3">
                      <img
                        src={rel.cover_url}
                        alt={rel.title}
                        style={{ height: '160px', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="card-body p-1 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="tag tag-ember" style={{ fontSize: '0.7rem' }}>
                          {rel.category || 'Artikel'}
                        </span>
                        <span className="small text-muted" style={{ fontSize: '0.74rem' }}>
                          {rel.read_time || '3 menit'}
                        </span>
                      </div>

                      <h6 className="card-title fw-bold mb-2 text-navy" style={{ lineHeight: 1.35 }}>
                        {rel.title}
                      </h6>

                      <p className="card-text small text-muted mb-3" style={{ lineHeight: 1.55 }}>
                        {rel.summary || rel.content.substring(0, 95) + '...'}
                      </p>
                    </div>

                    <div className="pt-2 border-top d-flex justify-content-between align-items-center mt-auto">
                      <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        Oleh {rel.author || 'Mohamad Farael Maulana'}
                      </span>
                      <span className="text-link small">Baca Artikel →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
