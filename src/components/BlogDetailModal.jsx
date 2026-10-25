import React from 'react';

export default function BlogDetailModal({ blog, onClose }) {
  if (!blog) return null;

  return (
    <div className="modal d-block modal-veil" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content modal-panel">
          <div className="modal-header px-4 py-3 align-items-start border-bottom">
            <div>
              <span className="tag tag-ember mb-2">{blog.category || 'Artikel'}</span>
              <h3 className="modal-title modal-title-serif mt-1 mb-0 fs-3">{blog.title}</h3>
            </div>
            <button type="button" className="close-text ms-3" onClick={onClose} aria-label="Tutup">
              Tutup
            </button>
          </div>

          <div className="modal-body p-4 p-md-5">
            <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-4 pb-3 border-bottom">
              <span>Penulis: <strong>{blog.author || 'Mohamad Farael Maulana'}</strong></span>
              <span>•</span>
              <span>{blog.date}</span>
              <span>•</span>
              <span>{blog.read_time || '3 menit baca'}</span>
            </div>

            {blog.cover_url && (
              <div className="card-media mb-4" style={{ maxHeight: '380px' }}>
                <img
                  src={blog.cover_url}
                  alt={blog.title}
                  style={{ width: '100%', height: '320px', objectFit: 'cover' }}
                />
              </div>
            )}

            <div className="blog-body" style={{ lineHeight: 1.85, fontSize: '1.05rem', color: 'var(--text)' }}>
              {blog.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="modal-footer px-4 py-3 border-top d-flex justify-content-between">
            <span className="text-muted small">Portal Pembelajaran Analisis &amp; Desain</span>
            <button type="button" className="btn btn-mist" onClick={onClose}>
              Selesai Membaca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
