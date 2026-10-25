import React from 'react';
import { Link } from 'react-router-dom';

export default function SuccessModal({
  isOpen,
  title = 'Data Berhasil Disimpan',
  subtitle = '',
  itemType = 'Berkas',
  item = null,
  targetUrl = '',
  onClose,
  onViewPreview,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal d-block modal-veil" style={{ zIndex: 1070 }} role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-panel" style={{ borderTop: '6px solid var(--green)' }}>
          <div className="modal-header px-4 pt-4 pb-2 border-0 align-items-start">
            <div>
              <span className="eyebrow mb-2">Notifikasi Sistem</span>
              <h4 className="modal-title modal-title-serif fs-3 mb-0 text-navy">{title}</h4>
            </div>
            <button
              type="button"
              className="close-text ms-3"
              onClick={onClose}
              aria-label="Tutup notifikasi"
            >
              Tutup
            </button>
          </div>

          <div className="modal-body px-4 py-3">
            <div className="d-flex align-items-center gap-3 p-3 mb-3 rounded" style={{ background: '#eaf6e5', border: '2px solid #84c071' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--green)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid var(--navy)',
                  boxShadow: '2px 2px 0 var(--navy)',
                }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3.5" fill="none">
                  <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <span className="tag mb-1" style={{ fontSize: '0.7rem' }}>{itemType} Tersimpan</span>
                <div className="fw-bold text-navy" style={{ lineHeight: 1.35 }}>
                  {subtitle || 'Dokumen telah tercatat di server dan siap diakses.'}
                </div>
              </div>
            </div>

            <p className="small text-muted mb-0" style={{ lineHeight: 1.6 }}>
              Dokumen kini dapat dibaca oleh dosen dan mahasiswa. Anda dapat langsung membuka pratinjau lengkap di bawah ini untuk memeriksa isi berkas.
            </p>
          </div>

          <div className="modal-footer px-4 pb-4 pt-2 border-0 d-flex flex-wrap gap-2 justify-content-between">
            <button type="button" className="btn btn-quiet" onClick={onClose}>
              Tutup
            </button>

            <div className="d-flex flex-wrap gap-2">
              {item && onViewPreview && (
                <button
                  type="button"
                  className="btn btn-ember"
                  onClick={() => {
                    onClose();
                    onViewPreview(item, itemType);
                  }}
                >
                  Buka Pratinjau Dokumen
                </button>
              )}
              {targetUrl && (
                <Link to={targetUrl} className="btn btn-mist" onClick={onClose}>
                  Buka Halaman {itemType}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
