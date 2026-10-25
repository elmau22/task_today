import React, { useState, useEffect } from 'react';
import { pdfExtractorService } from '../services/pdfExtractorService';

export default function PdfExtractedViewer({
  pdfUrl,
  pdfFile = null,
  title = 'Dokumen PDF',
  onClose = null,
}) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  // Mode Tampilan:
  // 'visual' (gambar lembar halaman), 'text' (teks per halaman), 'split' (berdampingan), 'continuous' (baca bersambung ala artikel)
  const [displayMode, setDisplayMode] = useState('visual');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [copiedText, setCopiedText] = useState(false);

  // Modal Lightbox untuk memperbesar gambar diagram yang terekstrak
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    if (pdfUrl || pdfFile) {
      startFullExtraction();
    }
  }, [pdfUrl, pdfFile]);

  async function startFullExtraction() {
    setLoading(true);
    setErrorMsg('');
    setPages([]);
    setProgress({ current: 0, total: 0, percent: 0 });

    try {
      const source = pdfFile || pdfUrl;
      const extracted = await pdfExtractorService.extractPdfPages(
        source,
        (prog) => {
          setProgress(prog);
        },
        (singlePage) => {
          setPages((prev) => {
            const exists = prev.some((p) => p.pageNumber === singlePage.pageNumber);
            if (exists) return prev;
            return [...prev, singlePage].sort((a, b) => a.pageNumber - b.pageNumber);
          });
        }
      );

      setPages(extracted);
    } catch (err) {
      console.error('Error saat ekstraksi PDF:', err);
      setErrorMsg(
        'Terjadi kendala saat membaca file PDF secara utuh. ' +
          (err.message || '') +
          '. Anda tetap dapat membuka berkas asli melalui tautan unduhan.'
      );
    } finally {
      setLoading(false);
    }
  }

  // Filter pencarian
  const filteredPages = pages.filter((p) => {
    if (!searchQuery.trim()) return true;
    return p.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Salin seluruh isi teks dari seluruh halaman
  const copyAllText = () => {
    const fullText = pages
      .map((p) => `--- HALAMAN ${p.pageNumber} ---\n${p.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2400);
    });
  };

  const handleExportPrint = () => {
    window.print();
  };

  const totalExtractedImages = pages.reduce(
    (acc, p) => acc + (p.extractedImages ? p.extractedImages.length : 0),
    0
  );

  return (
    <div className="pdf-extracted-container panel p-3 p-md-4 mb-4" style={{ background: '#fcfbf7' }}>
      {/* HEADER UTAMA ALAT EKSTRAKSI */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span className="eyebrow mb-0" style={{ fontSize: '0.74rem' }}>
              Ekstraksi Penuh PDF (Teks &amp; Gambar)
            </span>
            <span className="badge bg-success" style={{ fontSize: '0.72rem' }}>
              {loading
                ? `Memproses: ${pages.length} / ${progress.total || '?'} Hal`
                : `${pages.length} Halaman Lengkap Terekstrak`}
            </span>
            {totalExtractedImages > 0 && (
              <span className="badge bg-info text-dark" style={{ fontSize: '0.72rem' }}>
                {totalExtractedImages} Gambar &amp; Diagram Ditemukan
              </span>
            )}
          </div>
          <h3 className="h5 fw-bold text-navy mb-0">{title}</h3>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {pages.length > 0 && (
            <>
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={copyAllText}
                title="Salin seluruh teks dokumen hasil ekstraksi"
              >
                {copiedText ? 'Seluruh Teks Tersalin!' : 'Salin Seluruh Teks'}
              </button>

              <button
                type="button"
                className="btn btn-ember btn-sm"
                onClick={handleExportPrint}
                title="Cetak atau simpan seluruh modul dan lembaran PDF ini"
              >
                Eksport Dokumen Lengkap (Cetak PDF)
              </button>
            </>
          )}

          {onClose && (
            <button type="button" className="close-text ms-2" onClick={onClose} aria-label="Tutup">
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* INDIKATOR PROGRES EKSTRAKSI AKTIF */}
      {loading && (
        <div className="p-3 mb-3 rounded" style={{ background: '#eaf3f8', border: '2px solid #8cc7e8' }}>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-bold text-navy small">
              Mengekstrak Halaman {progress.current} dari {progress.total}... ({progress.percent}%)
            </span>
            <span className="small text-muted">{pages.length} halaman siap dibaca</span>
          </div>
          <div className="progress mb-2" style={{ height: '8px', border: '1px solid var(--navy)' }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${progress.percent}%`, transition: 'width 0.25s ease' }}
            ></div>
          </div>
          <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
            Mengekstrak teks, diagram, dan lembaran halaman secara berkelanjutan tanpa batasan agar seluruh isi dokumen tampil utuh.
          </div>
        </div>
      )}

      {/* PESAN JIKA ADA KENDALA */}
      {errorMsg && (
        <div className="p-3 mb-3 rounded" style={{ background: '#fff4f2', border: '2px solid #e0574f' }}>
          <div className="small text-danger fw-bold mb-1">{errorMsg}</div>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-mist btn-sm mt-2"
            >
              Unduh / Buka Berkas Asli di Tab Baru
            </a>
          )}
        </div>
      )}

      {/* BILAH KONTROL: PILIHAN MODE BACA & PENCARIAN TEKS */}
      {pages.length > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 p-2 bg-white rounded border">
          <div className="d-flex flex-wrap align-items-center gap-1">
            <span className="small text-muted me-1 ms-1 d-none d-sm-inline">Mode Baca:</span>
            <button
              type="button"
              className={`btn btn-quiet btn-sm ${displayMode === 'visual' ? 'is-on' : ''}`}
              onClick={() => setDisplayMode('visual')}
            >
              Lembaran Asli
            </button>
            <button
              type="button"
              className={`btn btn-quiet btn-sm ${displayMode === 'text' ? 'is-on' : ''}`}
              onClick={() => setDisplayMode('text')}
            >
              Teks &amp; Gambar
            </button>
            <button
              type="button"
              className={`btn btn-quiet btn-sm ${displayMode === 'continuous' ? 'is-on' : ''}`}
              onClick={() => setDisplayMode('continuous')}
            >
              Baca Bersambung
            </button>
            <button
              type="button"
              className={`btn btn-quiet btn-sm d-none d-lg-inline-block ${displayMode === 'split' ? 'is-on' : ''}`}
              onClick={() => setDisplayMode('split')}
            >
              Berdampingan
            </button>
          </div>

          <div className="d-flex align-items-center gap-2" style={{ maxWidth: '320px', width: '100%' }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Cari kata kunci dalam dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-quiet btn-sm py-0 px-2"
                onClick={() => setSearchQuery('')}
                title="Bersihkan pencarian"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* NAVIGASI LOMPAT NOMOR HALAMAN CEPAT */}
      {pages.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mb-4 align-items-center p-2 bg-white rounded border">
          <span className="small text-muted me-2 ms-1 fw-bold">Daftar Halaman ({pages.length}):</span>
          <div className="d-flex flex-wrap gap-1 overflow-auto" style={{ maxHeight: '80px' }}>
            {pages.map((p) => (
              <button
                key={p.pageNumber}
                type="button"
                className={`btn btn-sm py-0 px-2 ${activePage === p.pageNumber ? 'btn-ember' : 'btn-quiet'}`}
                style={{ fontSize: '0.76rem', minWidth: '32px' }}
                onClick={() => {
                  setActivePage(p.pageNumber);
                  const targetEl = document.getElementById(`pdf-page-${p.pageNumber}`);
                  if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                {p.pageNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= 4 PILIHAN TAMPILAN KONTEN EKSTRAKSI ================= */}

      {/* 1. MODE BACA TEKS BERSAMBUNG (SEPERTI ARTIKEL UTUH SATU DOKUMEN) */}
      {displayMode === 'continuous' && (
        <div className="panel p-4 p-md-5 mb-4 bg-white" style={{ lineHeight: 1.85, fontSize: '1.05rem' }}>
          <div className="mb-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
            <div>
              <span className="tag tag-ember mb-1">Teks Bersambung Seluruh Halaman</span>
              <h4 className="h5 fw-bold text-navy mb-0">Isi Lengkap Dokumen ({pages.length} Halaman)</h4>
            </div>
            <button type="button" className="btn btn-quiet btn-sm" onClick={copyAllText}>
              Salin Semua Teks
            </button>
          </div>

          {pages.map((page) => (
            <section key={page.pageNumber} id={`pdf-page-${page.pageNumber}`} className="mb-5 pb-4 border-bottom">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-secondary" style={{ fontSize: '0.78rem' }}>
                  Halaman {page.pageNumber}
                </span>
                <span className="small text-muted">Bagian {page.pageNumber} dari {pages.length}</span>
              </div>

              {/* Teks Halaman */}
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                {page.text || <em className="text-muted">[Halaman ini memuat visual/diagram]</em>}
              </div>

              {/* Gambar / Diagram Individual yang terekstrak di halaman ini */}
              {page.extractedImages && page.extractedImages.length > 0 && (
                <div className="mt-4 p-3 rounded" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                  <span className="eyebrow mb-2" style={{ fontSize: '0.74rem' }}>
                    Diagram &amp; Gambar Terekstrak (Halaman {page.pageNumber})
                  </span>
                  <div className="row g-3">
                    {page.extractedImages.map((imgItem, idx) => (
                      <div key={idx} className="col-12 col-md-8 mx-auto text-center">
                        <figure className="mb-0">
                          <img
                            src={imgItem.dataUrl}
                            alt={imgItem.name}
                            className="img-fluid rounded border shadow-sm cursor-pointer"
                            style={{ maxHeight: '360px', cursor: 'zoom-in', objectFit: 'contain' }}
                            onClick={() => setZoomImage(imgItem)}
                          />
                          <figcaption className="small text-muted mt-2">
                            {imgItem.name} ({imgItem.width} × {imgItem.height} px) — Klik untuk memperbesar
                          </figcaption>
                        </figure>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* 2. MODE PER HALAMAN (VISUAL / TEKS / SPLIT) */}
      {displayMode !== 'continuous' && (
        <div className="extracted-pages-list d-flex flex-column gap-4">
          {filteredPages.map((page) => (
            <div
              key={page.pageNumber}
              id={`pdf-page-${page.pageNumber}`}
              className="panel p-3 p-md-4 bg-white"
              style={{
                border: activePage === page.pageNumber ? '2.5px solid var(--navy)' : '1.5px solid rgba(20,40,63,0.18)',
                boxShadow: activePage === page.pageNumber ? '6px 6px 0 var(--navy)' : '3px 3px 0 rgba(20,40,63,0.1)',
              }}
            >
              {/* Header Halaman */}
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="tag tag-ember">
                    Halaman {page.pageNumber} dari {pages.length}
                  </span>
                  <span className="small text-muted d-none d-sm-inline">
                    {page.text ? `${page.text.split(' ').length} kata` : 'Halaman visual'}
                  </span>
                  {page.extractedImages && page.extractedImages.length > 0 && (
                    <span className="badge bg-primary text-white" style={{ fontSize: '0.72rem' }}>
                      {page.extractedImages.length} Diagram / Foto
                    </span>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(page.text);
                      alert(`Teks Halaman ${page.pageNumber} berhasil disalin!`);
                    }}
                    title="Salin teks khusus halaman ini"
                  >
                    Salin Teks Halaman
                  </button>
                </div>
              </div>

              {/* Mode Lembaran Visual */}
              {displayMode === 'visual' && page.imageUrl && (
                <div className="text-center p-2 rounded" style={{ background: '#f5f5f5' }}>
                  <img
                    src={page.imageUrl}
                    alt={`Halaman ${page.pageNumber}`}
                    className="img-fluid rounded"
                    style={{
                      maxHeight: '92vh',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                      border: '1px solid #d0d7de',
                    }}
                    loading="lazy"
                  />
                </div>
              )}

              {/* Mode Teks Per Halaman */}
              {displayMode === 'text' && (
                <div
                  className="p-3 bg-light rounded"
                  style={{
                    lineHeight: 1.8,
                    fontSize: '1rem',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: 'var(--text)',
                  }}
                >
                  {page.text || <em className="text-muted">Halaman ini memuat gambar visual/diagram.</em>}
                </div>
              )}

              {/* Mode Berdampingan (Split) */}
              {displayMode === 'split' && (
                <div className="row g-3 align-items-start">
                  <div className="col-lg-6 text-center">
                    {page.imageUrl && (
                      <img
                        src={page.imageUrl}
                        alt={`Halaman ${page.pageNumber}`}
                        className="img-fluid rounded border"
                        style={{ maxHeight: '600px', objectFit: 'contain' }}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="col-lg-6">
                    <div
                      className="p-3 bg-light rounded border h-100"
                      style={{
                        lineHeight: 1.75,
                        fontSize: '0.96rem',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '600px',
                        overflowY: 'auto',
                      }}
                    >
                      {page.text || <em className="text-muted">Halaman ini memuat gambar visual/diagram.</em>}
                    </div>
                  </div>
                </div>
              )}

              {/* BLOK DIAGRAM / GAMBAR INDIVIDUAL TEREKSTRAK DARI HALAMAN INI */}
              {page.extractedImages && page.extractedImages.length > 0 && (
                <div className="mt-4 p-3 rounded" style={{ background: '#f8fafc', border: '1.5px dashed #94a3b8' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="eyebrow mb-0" style={{ fontSize: '0.74rem' }}>
                        Diagram &amp; Gambar Terekstrak dari Halaman Ini
                      </span>
                      <span className="badge bg-secondary" style={{ fontSize: '0.72rem' }}>
                        {page.extractedImages.length} Berkas
                      </span>
                    </div>
                    <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                      Format PNG Asli
                    </span>
                  </div>

                  <div className="row g-3">
                    {page.extractedImages.map((imgItem, imgIdx) => (
                      <div key={imgItem.id || imgIdx} className="col-12 col-md-6 col-lg-4">
                        <div className="card h-100 p-2 border bg-white shadow-sm">
                          <div
                            className="text-center p-2 rounded cursor-pointer"
                            style={{
                              background: '#f1f5f9',
                              cursor: 'zoom-in',
                              overflow: 'hidden',
                              minHeight: '140px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onClick={() => setZoomImage(imgItem)}
                            title="Klik untuk memperbesar tampilan gambar"
                          >
                            <img
                              src={imgItem.dataUrl}
                              alt={imgItem.name}
                              className="img-fluid rounded"
                              style={{ maxHeight: '160px', objectFit: 'contain' }}
                              loading="lazy"
                            />
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                            <div>
                              <div className="fw-bold text-navy" style={{ fontSize: '0.78rem' }}>
                                {imgItem.name}
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Resolusi: {imgItem.width} × {imgItem.height} px
                              </div>
                            </div>

                            <div className="d-flex gap-1">
                              <button
                                type="button"
                                className="btn btn-quiet btn-sm py-0 px-2"
                                style={{ fontSize: '0.72rem' }}
                                onClick={() => setZoomImage(imgItem)}
                              >
                                Perbesar
                              </button>
                              <a
                                href={imgItem.dataUrl}
                                download={`ekstrak-hal-${page.pageNumber}-${imgItem.name}.png`}
                                className="btn btn-ember btn-sm py-0 px-2"
                                style={{ fontSize: '0.72rem' }}
                                title="Unduh gambar ini ke komputer/HP Anda"
                              >
                                Unduh
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {!loading && filteredPages.length === 0 && pages.length > 0 && (
            <div className="text-center py-5 text-muted panel p-4">
              Tidak ada halaman yang memuat kata kunci "{searchQuery}".
              <button
                type="button"
                className="btn btn-quiet btn-sm ms-2"
                onClick={() => setSearchQuery('')}
              >
                Tampilkan Semua Halaman
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL LIGHTBOX UNTUK MEMPERBESAR GAMBAR TEREKSTRAK */}
      {zoomImage && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(20, 40, 63, 0.75)', zIndex: 1060 }}
          onClick={() => setZoomImage(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px', overflow: 'hidden' }}>
              <div className="modal-header bg-navy text-white py-3 px-4">
                <div>
                  <h5 className="modal-title h6 fw-bold mb-0 text-white">
                    {zoomImage.name} ({zoomImage.width} × {zoomImage.height} px)
                  </h5>
                  <div className="small text-white-50" style={{ fontSize: '0.76rem' }}>
                    Hasil Ekstraksi Diagram PDF Utuh
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setZoomImage(null)}
                  aria-label="Tutup"
                ></button>
              </div>

              <div className="modal-body text-center p-4 bg-light" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
                <img
                  src={zoomImage.dataUrl}
                  alt={zoomImage.name}
                  className="img-fluid rounded border shadow-sm"
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>

              <div className="modal-footer bg-white py-2 px-4 justify-content-between">
                <span className="small text-muted">
                  Resolusi Asli: {zoomImage.width} x {zoomImage.height} piksel
                </span>
                <div className="d-flex gap-2">
                  <a
                    href={zoomImage.dataUrl}
                    download={`${zoomImage.name}.png`}
                    className="btn btn-ember btn-sm"
                  >
                    Unduh Gambar PNG
                  </a>
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => setZoomImage(null)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
