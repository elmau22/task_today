import React, { useState, useEffect } from 'react';
import { pdfExtractorService } from '../services/pdfExtractorService';

// Cache global dalam sesi agar render halaman 1 tidak diulang-ulang
const coverCache = new Map();

/**
 * Komponen Penampil Cover Dokumen yang secara cerdas:
 * 1. Menggunakan cover_url yang sudah ada jika valid (bukan placeholder).
 * 2. Mengambil dan me-render halaman pertama PDF secara otomatis jika cover_url kosong atau masih placeholder.
 * 3. Menyimpan hasil render di cache memori agar instan saat dibuka kembali.
 */
export default function PdfCoverImage({
  src,
  pdfUrl,
  alt = 'Cover Dokumen',
  className = '',
  style = {},
  fallback = null,
}) {
  const isPlaceholder =
    !src ||
    (typeof src === 'string' &&
      (src.includes('unsplash.com') || src === '#' || src.trim() === ''));

  const initialSrc = !isPlaceholder ? src : null;

  const [imageSrc, setImageSrc] = useState(initialSrc);
  const [loading, setLoading] = useState(isPlaceholder && Boolean(pdfUrl));

  useEffect(() => {
    // 1. Jika src valid dan bukan placeholder
    if (src && !src.includes('unsplash.com') && src !== '#') {
      setImageSrc(src);
      setLoading(false);
      return;
    }

    // 2. Jika ada berkas PDF, render halaman pertama
    if (pdfUrl && (pdfUrl.toLowerCase().includes('.pdf') || pdfUrl.startsWith('blob:'))) {
      if (coverCache.has(pdfUrl)) {
        setImageSrc(coverCache.get(pdfUrl));
        setLoading(false);
        return;
      }

      let isMounted = true;
      setLoading(true);

      pdfExtractorService
        .renderFirstPageAsCover(pdfUrl, { scale: 0.9, quality: 0.82 })
        .then((res) => {
          if (!isMounted) return;
          if (res && res.dataUrl) {
            coverCache.set(pdfUrl, res.dataUrl);
            setImageSrc(res.dataUrl);
          } else if (src) {
            setImageSrc(src);
          }
        })
        .catch((err) => {
          console.warn('Gagal memuat cover halaman 1:', err);
          if (isMounted && src) setImageSrc(src);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    } else if (src) {
      setImageSrc(src);
      setLoading(false);
    }
  }, [src, pdfUrl]);

  if (loading) {
    return (
      <div
        className={`d-flex flex-column align-items-center justify-content-center bg-light ${className}`}
        style={{
          ...style,
          minHeight: style.height || '140px',
          background: '#f1f5f9',
          border: '1px solid rgba(20,40,63,0.12)',
        }}
      >
        <span
          className="spinner-border spinner-border-sm text-secondary mb-1"
          role="status"
          style={{ width: '1rem', height: '1rem' }}
        ></span>
        <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
          Memuat halaman 1...
        </span>
      </div>
    );
  }

  if (!imageSrc) {
    if (fallback) return fallback;

    // Visual fallback khusus berkas slide presentasi PowerPoint
    if (
      pdfUrl &&
      (pdfUrl.toLowerCase().includes('.ppt') ||
        pdfUrl.toLowerCase().includes('.pptx') ||
        alt.toLowerCase().includes('ppt'))
    ) {
      return (
        <div
          className={`d-flex flex-column align-items-center justify-content-center p-3 text-center ${className}`}
          style={{
            ...style,
            background: 'linear-gradient(135deg, #d24726 0%, #a23015 100%)',
            color: '#ffffff',
            border: '2px solid var(--navy)',
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-1"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="fw-bold text-uppercase" style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>
            Slide Presentasi
          </span>
          <span className="small opacity-75" style={{ fontSize: '0.68rem' }}>
            PowerPoint (.pptx)
          </span>
        </div>
      );
    }

    return (
      <div
        className={`d-flex align-items-center justify-content-center bg-light ${className}`}
        style={{
          ...style,
          minHeight: style.height || '140px',
          background: '#f8fafc',
          color: 'var(--navy)',
          fontWeight: '600',
          fontSize: '0.85rem',
        }}
      >
        Dokumen Perkuliahan
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}
