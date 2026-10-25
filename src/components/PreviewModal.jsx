import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parseItemMetadata } from '../services/metadataHelper';

export default function PreviewModal({
  item,
  itemType,
  onClose,
  onRequestDelete,
  onRequestEdit,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerEngine, setViewerEngine] = useState('auto'); // 'auto', 'native', 'google', 'office'
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDesc, setShowDesc] = useState(true);

  useEffect(() => {
    // Reset state saat item berganti
    setIsFullscreen(false);
    setViewerEngine('auto');
    setCopiedLink(false);
    setShowDesc(true);
  }, [item]);

  if (!item) return null;

  const type = (item.file_type || '').toLowerCase();
  const url = item.file_url || '';
  const itemMeta = parseItemMetadata(item.description);

  const getYouTubeEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = rawUrl.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
      : rawUrl;
  };

  const copyDocumentLink = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    });
  };

  const renderViewerContent = () => {
    if (!url || url === '#') {
      return (
        <div className="text-center py-5 text-muted">
          <p className="mb-2 fw-semibold">Tautan berkas belum tersedia untuk item ini.</p>
          <span className="small">Silakan periksa kembali melalui menu Login jika ingin memperbarui berkas.</span>
        </div>
      );
    }

    // 1. Gambar / Diagram
    if (type === 'image') {
      return (
        <div
          className="media-frame d-flex align-items-center justify-content-center p-3 text-center"
          style={{
            minHeight: isFullscreen ? 'calc(90vh - 160px)' : '540px',
            background: '#f4f9fd',
          }}
        >
          <img
            src={url}
            alt={item.title}
            className="img-fluid rounded"
            style={{
              maxHeight: isFullscreen ? 'calc(88vh - 170px)' : '580px',
              objectFit: 'contain',
              boxShadow: '0 4px 14px rgba(20,40,63,0.12)',
            }}
          />
        </div>
      );
    }

    // 2. Video YouTube
    if (type === 'youtube') {
      return (
        <div className="ratio ratio-16x9 media-frame" style={{ minHeight: isFullscreen ? 'calc(88vh - 170px)' : '480px' }}>
          <iframe
            src={getYouTubeEmbedUrl(url)}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }

    // 3. Dokumen PDF
    if (type === 'pdf') {
      const activeEngine = viewerEngine === 'auto' ? 'native' : viewerEngine;

      if (activeEngine === 'google') {
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        return (
          <iframe
            src={googleDocsUrl}
            title={item.title}
            width="100%"
            style={{
              height: isFullscreen ? 'calc(92vh - 150px)' : '620px',
              border: 0,
              borderRadius: '8px',
            }}
            className="media-frame"
          />
        );
      }

      // Native PDF Viewer
      return (
        <iframe
          src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
          title={item.title}
          width="100%"
          style={{
            height: isFullscreen ? 'calc(92vh - 150px)' : '620px',
            border: 0,
            borderRadius: '8px',
          }}
          className="media-frame"
        />
      );
    }

    // 4. Slide Presentasi PPT, Excel, atau Word
    if (type === 'ppt' || type === 'excel' || type === 'word') {
      const activeEngine = viewerEngine === 'auto' ? 'office' : viewerEngine;

      const embedSrc =
        activeEngine === 'google'
          ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
          : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

      return (
        <div>
          <iframe
            src={embedSrc}
            title={item.title}
            width="100%"
            style={{
              height: isFullscreen ? 'calc(92vh - 150px)' : '580px',
              border: 0,
              borderRadius: '8px',
            }}
            className="media-frame"
          />
          <div className="notice notice-info mt-2 small d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span>
              Sedang menampilkan dokumen menggunakan mesin <strong>{activeEngine === 'google' ? 'Google Docs Viewer' : 'Microsoft Office Viewer'}</strong>.
            </span>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => setViewerEngine(activeEngine === 'google' ? 'office' : 'google')}
            >
              Ganti ke {activeEngine === 'google' ? 'Office Viewer' : 'Google Viewer'}
            </button>
          </div>
        </div>
      );
    }

    // Format Default Lainnya (fallback)
    return (
      <iframe
        src={url}
        title={item.title}
        width="100%"
        style={{ height: isFullscreen ? 'calc(90vh - 150px)' : '520px' }}
        className="media-frame"
      />
    );
  };

  // Menyesuaikan lebar modal seukuran dengan dokumen asli
  const getDocumentDialogStyle = () => {
    if (isFullscreen) return { maxWidth: '100%', margin: '0.5rem' };
    if (type === 'pdf') return { maxWidth: '920px', width: '96%' };
    if (type === 'ppt' || type === 'excel' || type === 'word' || type === 'youtube') {
      return { maxWidth: '1060px', width: '96%' };
    }
    return { maxWidth: '880px', width: '96%' };
  };

  return (
    <div className="modal d-block modal-veil" style={{ zIndex: 1060 }} role="dialog" aria-modal="true">
      <div
        className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${
          isFullscreen ? 'modal-fullscreen' : ''
        }`}
        style={getDocumentDialogStyle()}
      >
        <div className="modal-content modal-panel d-flex flex-column" style={{ maxHeight: isFullscreen ? '98vh' : '94vh' }}>
          
          {/* HEADER PRATINJAU */}
          <div className="modal-header px-4 py-3 align-items-start border-bottom">
            <div className="flex-grow-1 me-3">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <span className="tag tag-ember">
                  {itemType === 'Tugas'
                    ? `Tugas: ${item.student_name || 'Mahasiswa'}`
                    : `Materi Pertemuan ${item.meeting_number || '1'}`}
                </span>
                <span className="tag">
                  Format: {type.toUpperCase()}
                </span>
                {item.created_at && (
                  <span className="small text-muted d-none d-sm-inline">
                    Diunggah: {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </span>
                )}
              </div>
              <h4 className="modal-title modal-title-serif fs-4 mb-2 text-navy" style={{ lineHeight: 1.35, wordBreak: 'break-word' }}>
                {item.title}
              </h4>
              <div className="d-flex flex-column gap-1">
                <div className="small text-secondary fw-semibold" style={{ lineHeight: 1.35 }}>
                  {itemMeta.course} &bull; Dosen: {itemMeta.lecturer}
                </div>
                <div className="small text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                  {itemMeta.prodi} &bull; {itemMeta.university}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link
                to={`/${itemType === 'Tugas' ? 'tugas' : 'materi'}/${item.id}`}
                className="btn btn-quiet btn-sm d-none d-md-inline-block"
                onClick={onClose}
                title="Buka dokumen di halaman khusus tersendiri"
              >
                Buka Halaman Dokumen
              </Link>

              <button
                type="button"
                className={`btn btn-quiet btn-sm ${isFullscreen ? 'is-on' : ''}`}
                onClick={() => setIsFullscreen((prev) => !prev)}
                title={isFullscreen ? 'Keluar dari layar penuh' : 'Tampilkan layar penuh agar lebih nyaman membaca'}
              >
                {isFullscreen ? 'Kecilkan' : 'Layar Penuh'}
              </button>

              <button
                type="button"
                className="close-text"
                onClick={onClose}
                aria-label="Tutup jendela pratinjau"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* TOOLBAR PENGENDALI PEMBACA */}
          <div
            className="px-4 py-2 bg-light border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2"
            style={{ fontSize: '0.88rem' }}
          >
            <div className="d-flex flex-wrap align-items-center gap-2">
              {type === 'pdf' && (
                <div className="d-flex align-items-center gap-1">
                  <span className="text-muted small me-1">Mesin Baca:</span>
                  <button
                    type="button"
                    className={`btn btn-quiet btn-sm ${viewerEngine !== 'google' ? 'is-on' : ''}`}
                    onClick={() => setViewerEngine('native')}
                  >
                    Bawaan
                  </button>
                  <button
                    type="button"
                    className={`btn btn-quiet btn-sm ${viewerEngine === 'google' ? 'is-on' : ''}`}
                    onClick={() => setViewerEngine('google')}
                  >
                    Google Viewer
                  </button>
                </div>
              )}

              {item.description && (
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => setShowDesc((prev) => !prev)}
                >
                  {showDesc ? 'Sembunyikan Catatan' : 'Lihat Catatan Materi'}
                </button>
              )}
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
              {url && url !== '#' && (
                <>
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={copyDocumentLink}
                    title="Salin tautan berkas dokumen ini"
                  >
                    {copiedLink ? 'Tautan Disalin!' : 'Salin Tautan'}
                  </button>

                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-quiet btn-sm"
                    title="Buka dokumen di tab jendela baru"
                  >
                    Buka di Tab Baru
                  </a>
                </>
              )}
            </div>
          </div>

          {/* ISI PRATINJAU DOKUMEN */}
          <div className="modal-body p-3 p-md-4 flex-grow-1 overflow-auto">
            {itemMeta.cleanDescription && showDesc && (
              <div
                className="p-3 mb-3 rounded"
                style={{
                  background: '#fcfaf0',
                  border: '1.5px solid rgba(20,40,63,0.18)',
                  fontSize: '0.94rem',
                  lineHeight: 1.6,
                }}
              >
                <div className="fw-bold text-navy small mb-1">Catatan Dokumen / Petunjuk Materi:</div>
                <div className="text-muted">{itemMeta.cleanDescription}</div>
              </div>
            )}

            {renderViewerContent()}
          </div>

          {/* FOOTER AKSI */}
          <div className="modal-footer d-flex flex-wrap justify-content-between align-items-center px-4 py-3 border-top">
            {url && url !== '#' ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                download
                className="btn btn-mist"
              >
                Unduh Berkas Asli ({type.toUpperCase()})
              </a>
            ) : (
              <span className="text-muted small">Task Today • Portal Tugas &amp; Materi Kuliah</span>
            )}

            <div className="d-flex flex-wrap gap-2">
              <Link
                to={`/${itemType === 'Tugas' ? 'tugas' : 'materi'}/${item.id}`}
                className="btn btn-mist"
                onClick={onClose}
              >
                Buka Dokumen Lengkap
              </Link>
              {onRequestEdit && (
                <button
                  type="button"
                  className="btn btn-mist"
                  onClick={() => onRequestEdit(item)}
                >
                  Edit Berkas
                </button>
              )}
              {onRequestDelete && (
                <button
                  type="button"
                  className="btn btn-danger-soft"
                  onClick={() => onRequestDelete(item)}
                >
                  Hapus Permanen
                </button>
              )}
              <button type="button" className="btn btn-ember" onClick={onClose}>
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
