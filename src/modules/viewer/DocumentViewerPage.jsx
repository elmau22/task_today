import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { curriculumService } from '../../services/curriculumService';
import { parseItemMetadata } from '../../services/metadataHelper';
import PdfExtractedViewer from '../../components/PdfExtractedViewer';

export default function DocumentViewerPage({ type = 'materi' }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Progres Belajar / Pengerjaan Tugas (Disimpan di LocalStorage)
  const storageKey = type === 'materi' ? 'portal_completed_meetings' : 'portal_completed_tasks';
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tampilan Ekstraksi Halaman PDF Penuh & Slide Asli (Aktif otomatis jika berkas PDF)
  const [showExtractedPdf, setShowExtractedPdf] = useState(true);
  const [showOriginalSlide, setShowOriginalSlide] = useState(false);
  const [viewerEngine, setViewerEngine] = useState('auto'); // 'auto', 'native', 'google', 'office'
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomDiagram, setZoomDiagram] = useState(null);
  const [showDocMenu, setShowDocMenu] = useState(false);
  const docMenuRef = useRef(null);

  // Tutup dropdown menu opsi berkas saat klik di luar area
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (docMenuRef.current && !docMenuRef.current.contains(e.target)) {
        setShowDocMenu(false);
      }
    };
    if (showDocMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showDocMenu]);

  // Perbarui completedIds saat berpindah antara materi dan tugas
  useEffect(() => {
    try {
      const currentKey = type === 'materi' ? 'portal_completed_meetings' : 'portal_completed_tasks';
      const saved = localStorage.getItem(currentKey);
      setCompletedIds(saved ? JSON.parse(saved) : []);
    } catch {
      setCompletedIds([]);
    }
  }, [type]);

  useEffect(() => {
    loadClassroomData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSidebarOpenMobile(false);
  }, [id, type]);

  async function loadClassroomData() {
    setLoading(true);
    setErrorMsg('');

    try {
      let activeItem = null;

      if (type === 'materi') {
        // 1. Ambil seluruh daftar materi untuk sidebar
        const { data: mats } = await supabase
          .from('materials')
          .select('*')
          .order('meeting_number', { ascending: true });

        const materialsList = mats || [];
        setSidebarItems(materialsList);

        // Cari materi aktif berdasarkan id di URL
        const current = materialsList.find((m) => m.id === id);
        if (current) {
          activeItem = current;
        } else {
          const { data: directData, error } = await supabase
            .from('materials')
            .select('*')
            .eq('id', id)
            .single();

          if (error || !directData) {
            throw new Error('Materi perkuliahan tidak ditemukan.');
          }
          activeItem = directData;
        }
      } else {
        // 2. Ambil seluruh daftar tugas untuk sidebar tugas
        const { data: tasks } = await supabase
          .from('assignments')
          .select('*')
          .order('created_at', { ascending: false });

        const taskList = tasks || [];
        setSidebarItems(taskList);

        // Cari tugas aktif berdasarkan id di URL
        const current = taskList.find((t) => t.id === id);
        if (current) {
          activeItem = current;
        } else {
          const { data: directData, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('id', id)
            .single();

          if (error || !directData) {
            throw new Error('Dokumen tugas perkuliahan tidak ditemukan.');
          }
          activeItem = directData;
        }
      }

      setItem(activeItem);

      // Otomatis aktifkan ekstraksi dokumen jika berkas adalah PDF tanpa perlu menekan button
      if (activeItem) {
        const isPdf =
          activeItem.file_type?.toLowerCase() === 'pdf' ||
          (activeItem.file_url && activeItem.file_url.toLowerCase().includes('.pdf'));
        setShowExtractedPdf(Boolean(isPdf));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat dokumen pembelajaran.');
    } finally {
      setLoading(false);
    }
  }

  // Tandai Selesai / Belum Selesai (Disimpan di LocalStorage)
  const toggleComplete = (targetItemId) => {
    const targetId = targetItemId || id;
    let updated;
    if (completedIds.includes(targetId)) {
      updated = completedIds.filter((itemKey) => itemKey !== targetId);
    } else {
      updated = [...completedIds, targetId];
    }
    setCompletedIds(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const copyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    });
  };

  const getYouTubeEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = rawUrl.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
      : rawUrl;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <span className="eyebrow mb-3">Memuat Dokumen Perkuliahan</span>
        <h2 className="section-title mt-2">Menyiapkan Modul Lengkap...</h2>
        <p className="text-muted">Menyusun teks bacaan, silabus, dan diagram ala Dicoding.</p>
      </div>
    );
  }

  if (errorMsg || !item) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="panel p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <span className="eyebrow mb-3 text-danger border-danger">Pemberitahuan</span>
          <h2 className="h3 mb-3">{errorMsg || 'Dokumen Tidak Ditemukan'}</h2>
          <p className="text-muted mb-4">
            Dokumen yang Anda cari mungkin telah diperbarui atau dipindahkan oleh pengajar.
          </p>
          <Link to={type === 'materi' ? '/materi' : '/tugas'} className="btn btn-ember">
            Kembali ke Katalog {type === 'materi' ? 'Materi' : 'Tugas'}
          </Link>
        </div>
      </div>
    );
  }

  // Metadata dinamis (Mata Kuliah, Dosen Pengampu, Prodi, Universitas)
  const itemMeta = parseItemMetadata(item?.description);

  // Data modul kurikulum ala Dicoding (Mendukung Materi & Tugas)
  const moduleData =
    type === 'materi'
      ? curriculumService.getModuleContent(item.meeting_number || 1, item.title, itemMeta.cleanDescription)
      : curriculumService.getTaskContent({
          ...item,
          description: itemMeta.cleanDescription,
          parsedMeta: itemMeta,
        });

  // Navigasi item berikutnya / sebelumnya
  const currentIndex = sidebarItems.findIndex((s) => s.id === id);
  const prevItem = currentIndex > 0 ? sidebarItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex !== -1 && currentIndex < sidebarItems.length - 1
      ? sidebarItems[currentIndex + 1]
      : null;

  const totalItems = sidebarItems.length || 1;
  const completedCount = completedIds.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalItems) * 100));
  const isCurrentCompleted = completedIds.includes(id);

  // Penampil Berkas Asli (Native / Google Docs / Office / YouTube)
  const renderOriginalFileViewer = () => {
    const fileUrl = item.file_url;
    const fileType = item.file_type?.toLowerCase() || '';

    if (!fileUrl || fileUrl === '#') {
      return (
        <div className="p-4 text-center text-muted bg-light rounded">
          Pengunggah tidak menyertakan berkas lampiran untuk dokumen ini.
        </div>
      );
    }

    if (fileType === 'youtube' || fileUrl.includes('youtube.com') || fileUrl.includes('youtu.be')) {
      const embedUrl = getYouTubeEmbedUrl(fileUrl);
      return (
        <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm">
          <iframe src={embedUrl} title={item.title} allowFullScreen />
        </div>
      );
    }

    if (fileType === 'pdf' || fileUrl.toLowerCase().includes('.pdf')) {
      if (viewerEngine === 'google') {
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
          fileUrl
        )}&embedded=true`;
        return (
          <iframe
            src={googleDocsUrl}
            title={item.title}
            width="100%"
            style={{ height: '75vh', border: 0, borderRadius: '8px' }}
          />
        );
      }
      return (
        <object
          data={fileUrl}
          type="application/pdf"
          width="100%"
          style={{ height: '75vh', borderRadius: '8px' }}
        >
          <div className="p-4 text-center bg-light rounded">
            Browser Anda tidak mendukung preview PDF langsung.
            <div className="mt-2">
              <a href={fileUrl} target="_blank" rel="noreferrer" className="btn btn-quiet btn-sm">
                Buka PDF di Tab Baru
              </a>
            </div>
          </div>
        </object>
      );
    }

    if (
      ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(fileType) ||
      fileUrl.includes('.ppt') ||
      fileUrl.includes('.doc')
    ) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        fileUrl
      )}`;
      return (
        <iframe
          src={officeViewerUrl}
          title={item.title}
          width="100%"
          style={{ height: '75vh', border: 0, borderRadius: '8px' }}
        />
      );
    }

    return (
      <iframe
        src={fileUrl}
        title={item.title}
        width="100%"
        style={{ height: '60vh', border: 0, borderRadius: '10px' }}
      />
    );
  };

  return (
    <div className="container-fluid px-lg-5 py-3">
      {/* BAR NAVIGASI ATAS MOBILE */}
      <div className="d-lg-none d-flex justify-content-between align-items-center p-2 mb-3 panel">
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={() => setIsSidebarOpenMobile((prev) => !prev)}
        >
          {isSidebarOpenMobile
            ? 'Tutup Daftar'
            : type === 'materi'
            ? 'Daftar Pertemuan (Silabus)'
            : 'Daftar Tugas Mahasiswa'}
        </button>

        <span className="small fw-bold text-navy">
          {completedCount} / {totalItems} Selesai ({progressPercent}%)
        </span>
      </div>

      <div className="row g-4">
        {/* ================= SIDEBAR KIRI: DAFTAR SILABUS / TUGAS (ALA DICODING) ================= */}
        <aside
          className={`col-lg-4 col-xl-3 ${
            isSidebarOpenMobile ? 'd-block' : 'd-none d-lg-block'
          }`}
        >
          <div
            className="panel p-3 p-xl-4 sticky-top"
            style={{
              top: '84px',
              maxHeight: 'calc(100vh - 104px)',
              overflowY: 'auto',
            }}
          >
            <div className="mb-3 pb-3 border-bottom">
              <span className="eyebrow mb-2" style={{ fontSize: '0.75rem' }}>
                {type === 'materi' ? 'Silabus Perkuliahan' : 'Portofolio Tugas'}
              </span>
              <h2 className="h5 fw-bold text-navy mb-1">
                {type === 'materi' ? 'Silabus Perkuliahan' : 'Koleksi Tugas Kuliah'}
              </h2>
              <div className="small text-muted mb-2">Task Today • Portal Belajar</div>

              {/* Progress Bar Penyelesaian Belajar / Tugas */}
              <div
                className="progress mb-2"
                style={{ height: '8px', background: '#e2edf5', border: '1px solid var(--navy)' }}
              >
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: 'var(--green)',
                    transition: 'width 0.4s ease',
                  }}
                  aria-valuenow={progressPercent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="d-flex justify-content-between small text-muted">
                <span>{type === 'materi' ? 'Progres Belajar' : 'Progres Tugas'}</span>
                <strong className="text-navy">{progressPercent}% Selesai</strong>
              </div>
            </div>

            {/* List Modul Pertemuan atau Daftar Tugas */}
            <div className="d-flex flex-column gap-2">
              {sidebarItems.map((sItem) => {
                const isActive = sItem.id === id;
                const isDone = completedIds.includes(sItem.id);
                const sMeta = parseItemMetadata(sItem.description);

                return (
                  <div
                    key={sItem.id}
                    onClick={() => {
                      if (!isActive) navigate(`/${type}/${sItem.id}`);
                    }}
                    className="p-2 p-xl-3 rounded d-flex align-items-start gap-2 clickable"
                    style={{
                      background: isActive ? 'var(--paper)' : 'transparent',
                      border: isActive ? '2px solid var(--navy)' : '1px solid rgba(20,40,63,0.12)',
                      boxShadow: isActive ? '3px 3px 0 var(--navy)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <button
                      type="button"
                      className="btn p-0 border-0 bg-transparent mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(sItem.id);
                      }}
                      title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                      style={{ lineHeight: 1 }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isDone ? '2px solid var(--green)' : '2px solid #8ba0b2',
                          background: isDone ? 'var(--green)' : '#fff',
                          color: '#fff',
                          textAlign: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        {isDone ? '✓' : ''}
                      </span>
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                        <span
                          className="tag tag-ember"
                          style={{ fontSize: '0.68rem', padding: '1px 6px' }}
                        >
                          {type === 'materi'
                            ? `Pertemuan ${sItem.meeting_number}`
                            : (sItem.file_type || 'TUGAS').toUpperCase()}
                        </span>
                        {isActive && (
                          <span
                            className="badge bg-primary text-white"
                            style={{ fontSize: '0.65rem' }}
                          >
                            Sedang Dibaca
                          </span>
                        )}
                      </div>
                      <div
                        className="fw-bold text-truncate"
                        style={{
                          fontSize: '0.88rem',
                          color: isActive ? 'var(--navy)' : 'var(--text)',
                          lineHeight: 1.35,
                        }}
                      >
                        {sItem.title}
                      </div>
                      <div className="small text-secondary text-truncate" style={{ fontSize: '0.74rem' }}>
                        {sMeta.course}
                      </div>
                      {type === 'tugas' && sItem.student_name && (
                        <div className="small text-muted" style={{ fontSize: '0.72rem' }}>
                          Oleh: {sItem.student_name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {sidebarItems.length === 0 && (
                <div className="text-center py-4 text-muted small">
                  Daftar dokumen sedang dimuat...
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-top text-center">
              <Link to={type === 'materi' ? '/materi' : '/tugas'} className="btn btn-quiet btn-sm w-100">
                Kembali ke Katalog {type === 'materi' ? 'Materi' : 'Tugas'}
              </Link>
            </div>
          </div>
        </aside>

        {/* ================= AREA KANAN: KONTEN BACAAN DOKUMEN LENGKAP (ALA DICODING) ================= */}
        <main className="col-lg-8 col-xl-9">
          {/* BILAH ALAT MEMBACA ATAS (RINGKAS & INLINE) */}
          <div className="panel px-3 py-2 px-md-4 py-md-3 mb-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              {/* SISI KIRI: Breadcrumb & Pertemuan */}
              <div className="d-flex align-items-center gap-2 flex-wrap" style={{ minWidth: 0 }}>
                <Link
                  to={type === 'materi' ? '/materi' : '/tugas'}
                  className="text-link small text-decoration-none fw-semibold"
                >
                  {type === 'materi' ? 'Materi' : 'Tugas'}
                </Link>
                <span className="text-muted small">/</span>
                <span className="tag tag-ember py-0" style={{ fontSize: '0.72rem' }}>
                  {type === 'materi'
                    ? `Pertemuan ${item.meeting_number || '1'}`
                    : (item.file_type || 'TUGAS').toUpperCase()}
                </span>
                {moduleData && (
                  <span className="small text-muted d-none d-sm-inline" style={{ fontSize: '0.8rem' }}>
                    &bull; {moduleData.readingTime}
                  </span>
                )}
              </div>

              {/* SISI KANAN: AKSI RINGKAS (1 Primary, 1 Dropdown Dokumen, 1 Quick Share) */}
              <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
                {/* 1. Primary Action */}
                <button
                  type="button"
                  className={`btn btn-sm ${isCurrentCompleted ? 'btn-quiet is-on' : 'btn-ember'} d-inline-flex align-items-center gap-1 fw-semibold`}
                  onClick={() => toggleComplete(item.id)}
                  title={isCurrentCompleted ? 'Tandai belum selesai dipelajari' : 'Tandai selesai dipelajari'}
                >
                  {isCurrentCompleted ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Selesai ✓</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 14 14" />
                      </svg>
                      <span>Tandai Selesai</span>
                    </>
                  )}
                </button>

                {/* 2. Secondary Actions: Dropdown Opsi Dokumen */}
                <div className="position-relative" ref={docMenuRef}>
                  <button
                    type="button"
                    className={`btn btn-quiet btn-sm d-inline-flex align-items-center gap-1 ${showDocMenu ? 'is-on' : ''}`}
                    onClick={() => setShowDocMenu((prev) => !prev)}
                    aria-expanded={showDocMenu}
                    title="Pilihan tampilan berkas, ekstraksi, dan cetak"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>Opsi Dokumen</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transition: 'transform 0.2s ease',
                        transform: showDocMenu ? 'rotate(180deg)' : 'none',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showDocMenu && (
                    <div
                      className="dropdown-menu show shadow-sm p-1 position-absolute end-0 mt-2"
                      style={{
                        zIndex: 1050,
                        minWidth: '240px',
                        background: 'var(--paper)',
                        border: 'var(--outline)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(20,40,63,0.18)',
                      }}
                    >
                      {/* Opsi Ekstraksi PDF */}
                      {item.file_url && (item.file_type === 'pdf' || item.file_url.toLowerCase().includes('.pdf')) && (
                        <button
                          type="button"
                          className="dropdown-item d-flex align-items-center justify-content-between p-2 rounded small"
                          onClick={() => {
                            setShowExtractedPdf((prev) => !prev);
                            if (!showExtractedPdf) setShowOriginalSlide(false);
                            setShowDocMenu(false);
                          }}
                        >
                          <span className="d-flex align-items-center gap-2">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <line x1="9" y1="3" x2="9" y2="21" />
                            </svg>
                            <span>{showExtractedPdf ? 'Tutup Ekstraksi PDF' : 'Ekstrak Dokumen PDF'}</span>
                          </span>
                          {showExtractedPdf && (
                            <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Aktif</span>
                          )}
                        </button>
                      )}

                      {/* Opsi Berkas Asli */}
                      {item.file_url && item.file_url !== '#' && (
                        <button
                          type="button"
                          className="dropdown-item d-flex align-items-center justify-content-between p-2 rounded small"
                          onClick={() => {
                            setShowOriginalSlide((prev) => !prev);
                            if (!showOriginalSlide) setShowExtractedPdf(false);
                            setShowDocMenu(false);
                          }}
                        >
                          <span className="d-flex align-items-center gap-2">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>{showOriginalSlide ? 'Sembunyikan Berkas Asli' : 'Lihat Berkas Asli'}</span>
                          </span>
                          {showOriginalSlide && (
                            <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>Aktif</span>
                          )}
                        </button>
                      )}

                      <div className="dropdown-divider my-1" style={{ borderColor: 'var(--line)' }} />

                      {/* Opsi Cetak / Eksport PDF */}
                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center gap-2 p-2 rounded small"
                        onClick={() => {
                          setShowDocMenu(false);
                          window.print();
                        }}
                        title="Cetak modul dokumen ini ke format PDF bersih"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 6 2 18 2 18 9" />
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        <span>Cetak / Eksport PDF</span>
                      </button>

                      {/* Opsi Buka Berkas di Tab Baru */}
                      {item.file_url && item.file_url !== '#' && (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="dropdown-item d-flex align-items-center gap-2 p-2 rounded small"
                          onClick={() => setShowDocMenu(false)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          <span>Buka Berkas di Tab Baru</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Quick Action: Bagikan Dokumen (Ikon Ringkas) */}
                <button
                  type="button"
                  className="btn btn-quiet btn-sm d-inline-flex align-items-center justify-content-center"
                  onClick={copyPageUrl}
                  title={copiedLink ? 'Tautan halaman berhasil disalin!' : 'Bagikan tautan dokumen'}
                  aria-label="Bagikan dokumen"
                  style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px' }}
                >
                  {copiedLink ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* JIKA USER MEMILIH EKSTRAKSI HALAMAN PDF LENGKAP */}
          {showExtractedPdf && item.file_url && (
            <PdfExtractedViewer
              pdfUrl={item.file_url}
              title={item.title}
              onClose={() => setShowExtractedPdf(false)}
            />
          )}

          {/* JIKA USER MEMILIH MELIHAT PENAMPIL BERKAS ASLI (MODEL HYBRID) */}
          {showOriginalSlide && (
            <div className="panel p-3 p-md-4 mb-4 border-primary" style={{ background: '#f5f9fc' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <span className="eyebrow mb-1">Lampiran Berkas Asli</span>
                  <h3 className="h6 fw-bold mb-0 text-navy">
                    {type === 'materi'
                      ? `Dokumen Presentasi / Berkas Pertemuan ${item.meeting_number || ''}`
                      : `Lampiran Tugas: ${item.title}`}
                  </h3>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {item.file_type === 'pdf' && (
                    <div className="d-flex gap-1">
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

                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="btn btn-ember btn-sm"
                  >
                    Unduh Berkas Asli
                  </a>
                </div>
              </div>

              {renderOriginalFileViewer()}
            </div>
          )}

          {/* ================= ARTIKEL BACAAN UTAMA (ALA DICODING CLASSROOM) ================= */}
          <article className="panel p-4 p-md-5 mb-4" style={{ background: '#ffffff' }}>
            {/* Header Modul / Tugas */}
            <header className="mb-4 pb-3 border-bottom">
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="eyebrow mb-0">
                  {type === 'materi' ? 'Modul Perkuliahan Lengkap' : 'Dokumen Tugas Mahasiswa'}
                </span>
                {item.meeting_number && (
                  <span className="tag tag-ember">
                    Pertemuan {item.meeting_number}
                  </span>
                )}
                {type === 'tugas' && (
                  <span className="badge bg-secondary">
                    {item.file_type?.toUpperCase() || 'DOKUMEN'}
                  </span>
                )}
              </div>

              <h1 className="h2 font-display fw-bold text-navy mb-2" style={{ lineHeight: 1.25 }}>
                {item.title}
              </h1>

              {/* Subtitle Mata Kuliah & Dosen */}
              <div className="text-secondary fw-semibold mb-2" style={{ fontSize: '1rem' }}>
                {itemMeta.course}
              </div>

              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mt-2">
                <span>
                  Dosen Pengampu: <strong>{itemMeta.lecturer}</strong>
                </span>
                {item.student_name && (
                  <>
                    <span>•</span>
                    <span>
                      Mahasiswa: <strong>{item.student_name}</strong>
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{itemMeta.prodi}</span>
                <span>•</span>
                <span>{itemMeta.university}</span>
              </div>

              {/* Metadata Informasi Mata Kuliah, Dosen, Prodi & Kampus */}
              <div
                className="mt-3 p-3 rounded"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
              >
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <strong className="text-navy">Mata Kuliah:</strong> {itemMeta.course}
                  </div>
                  <div className="col-12 col-md-6">
                    <strong className="text-navy">Dosen Pengampu:</strong> {itemMeta.lecturer}
                  </div>
                  <div className="col-12 col-md-6">
                    <strong className="text-navy">Program Studi:</strong> {itemMeta.prodi}
                  </div>
                  <div className="col-12 col-md-6">
                    <strong className="text-navy">Universitas:</strong> {itemMeta.university}
                  </div>
                  {item.student_name && (
                    <div className="col-12 col-md-6">
                      <strong className="text-navy">Penyusun / Mahasiswa:</strong> {item.student_name}
                    </div>
                  )}
                  {type === 'materi' && item.meeting_number && (
                    <div className="col-12 col-md-6">
                      <strong className="text-navy">Pertemuan:</strong> Pertemuan Ke-{item.meeting_number}
                    </div>
                  )}
                  {moduleData?.meta?.subCpmk && (
                    <div className="col-12">
                      <strong className="text-navy">Sub-CPMK:</strong> {moduleData.meta.subCpmk}{' '}
                      {moduleData.meta.cpmk ? `(${moduleData.meta.cpmk})` : ''}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Kotak Sasaran Belajar / Capaian Pembelajaran */}
            {moduleData?.objectives && (
              <div
                className="p-3 p-md-4 mb-4 rounded"
                style={{
                  background: '#f2f8ed',
                  border: '2px solid #84c071',
                  boxShadow: '3px 3px 0 var(--navy)',
                }}
              >
                <div className="fw-bold text-navy mb-2 d-flex align-items-center gap-2">
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--green)',
                      display: 'inline-block',
                    }}
                  ></span>
                  {type === 'materi'
                    ? 'Tujuan Pembelajaran Modul Ini:'
                    : 'Sasaran & Capaian Tugas Mahasiswa:'}
                </div>
                <ul className="mb-0 ps-3 text-muted small" style={{ lineHeight: 1.7 }}>
                  {moduleData.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>

                {moduleData.indicators && (
                  <div
                    className="mt-3 pt-2 border-top"
                    style={{ borderColor: 'rgba(132, 192, 113, 0.4)' }}
                  >
                    <div className="fw-bold text-navy small mb-1">Indikator Penilaian:</div>
                    <ul className="mb-0 ps-3 text-muted small" style={{ lineHeight: 1.6 }}>
                      {moduleData.indicators.map((ind, indIdx) => (
                        <li key={indIdx}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Isi Bab-Bab Bacaan Modul & Tugas (Ala Dicoding Classroom) */}
            {moduleData?.sections && (
              <div
                className="module-body"
                style={{
                  lineHeight: 1.85,
                  fontSize: '1.06rem',
                  color: 'var(--text)',
                }}
              >
                {moduleData.sections.map((section, idx) => (
                  <div key={idx} className="mb-5">
                    <h2
                      className="h4 font-display fw-bold text-navy mb-3 pb-2 border-bottom"
                      style={{ letterSpacing: '0.01em' }}
                    >
                      {section.heading}
                    </h2>

                    {/* Paragraf Isi */}
                    {section.content.split('\n\n').map((par, pIdx) => (
                      <p key={pIdx} className="mb-3" style={{ whiteSpace: 'pre-line' }}>
                        {par}
                      </p>
                    ))}

                    {/* Gambar / Diagram Tersemat */}
                    {section.image && (
                      <figure
                        className="my-4 text-center p-3 p-md-4 rounded"
                        style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1' }}
                      >
                        <img
                          src={section.image.url}
                          alt={section.image.alt || section.heading}
                          className="img-fluid rounded shadow-sm cursor-pointer"
                          style={{ maxHeight: '420px', cursor: 'zoom-in', objectFit: 'contain' }}
                          onClick={() => setZoomDiagram(section.image)}
                          onError={(e) => {
                            if (section.image.fallbackUrl && e.target.src !== section.image.fallbackUrl) {
                              e.target.src = section.image.fallbackUrl;
                            }
                          }}
                          loading="lazy"
                        />
                        {section.image.caption && (
                          <figcaption className="small text-muted mt-2 fst-italic">
                            {section.image.caption} —{' '}
                            <span
                              className="text-primary text-decoration-underline"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setZoomDiagram(section.image)}
                            >
                              Klik untuk memperbesar tampilan
                            </span>
                          </figcaption>
                        )}
                      </figure>
                    )}

                    {/* Tabel Data Tersemat */}
                    {section.table && (
                      <div className="my-4 table-responsive">
                        {section.table.title && (
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge bg-secondary" style={{ fontSize: '0.72rem' }}>
                              Tabel
                            </span>
                            <h4 className="h6 fw-bold text-navy mb-0">{section.table.title}</h4>
                          </div>
                        )}
                        <table
                          className="table table-bordered table-hover align-middle mb-1"
                          style={{ borderColor: 'rgba(20,40,63,0.18)', background: '#fff' }}
                        >
                          <thead style={{ background: '#f1f5f9' }}>
                            <tr>
                              {section.table.headers.map((h, hIdx) => (
                                <th
                                  key={hIdx}
                                  className="text-navy fw-bold"
                                  style={{ fontSize: '0.86rem', whiteSpace: 'nowrap' }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={cIdx === 0 ? 'fw-bold text-navy' : 'text-muted'}
                                    style={{ fontSize: '0.86rem', lineHeight: 1.6 }}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Callout Box Ala Dicoding */}
                    {section.callout && (
                      <div
                        className="p-3 my-3 rounded"
                        style={{
                          background:
                            section.callout.type === 'important'
                              ? '#fef8ea'
                              : section.callout.type === 'tip'
                              ? '#edf6fc'
                              : '#eef8eb',
                          borderLeft: `5px solid ${
                            section.callout.type === 'important'
                              ? 'var(--sun)'
                              : section.callout.type === 'tip'
                              ? 'var(--blue)'
                              : 'var(--green)'
                          }`,
                          borderTop: '1px solid rgba(20,40,63,0.1)',
                          borderRight: '1px solid rgba(20,40,63,0.1)',
                          borderBottom: '1px solid rgba(20,40,63,0.1)',
                        }}
                      >
                        <div
                          className="fw-bold text-navy small mb-1"
                          style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                        >
                          {section.callout.title}
                        </div>
                        <div
                          className="small text-muted"
                          style={{ lineHeight: 1.65, whiteSpace: 'pre-line' }}
                        >
                          {section.callout.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Kotak Unduh Berkas Pendukung di Akhir Modul */}
            {item.file_url && item.file_url !== '#' && (
              <div
                className="p-4 rounded mt-5 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                style={{
                  background: 'var(--cream)',
                  border: '2px solid var(--navy)',
                  boxShadow: '4px 4px 0 var(--navy)',
                }}
              >
                <div>
                  <span className="tag mb-1">
                    {type === 'materi' ? 'Materi Lengkap' : 'Lampiran Dokumen Tugas'}
                  </span>
                  <h3 className="h6 fw-bold text-navy mb-1">
                    {type === 'materi'
                      ? `Unduh Dokumen Asli Pertemuan ${item.meeting_number || ''}`
                      : `Unduh Berkas Lampiran Tugas (${item.student_name || 'Mahasiswa'})`}
                  </h3>
                  <p className="small text-muted mb-0">
                    Format berkas siap dipelajari atau disimpan langsung ke perangkat Anda.
                  </p>
                </div>

                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn btn-ember text-nowrap"
                >
                  Unduh Berkas ({item.file_type?.toUpperCase() || 'BERKAS'})
                </a>
              </div>
            )}
          </article>

          {/* ================= NAVIGASI BAWAH: SEBELUMNYA & SELANJUTNYA (ALA DICODING) ================= */}
          <div className="panel p-3 p-md-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
            <div>
              {prevItem ? (
                <button
                  type="button"
                  className="btn btn-mist btn-sm"
                  onClick={() => navigate(`/${type}/${prevItem.id}`)}
                >
                  ← {type === 'materi' ? `Pertemuan ${prevItem.meeting_number}: ` : 'Tugas: '}
                  {prevItem.title.substring(0, 22)}...
                </button>
              ) : (
                <span className="small text-muted">Awal daftar.</span>
              )}
            </div>

            <button
              type="button"
              className={`btn ${isCurrentCompleted ? 'btn-mist' : 'btn-ember'}`}
              onClick={() => {
                if (!isCurrentCompleted) toggleComplete(item.id);
                if (nextItem) navigate(`/${type}/${nextItem.id}`);
              }}
            >
              {nextItem
                ? `Selesai & Lanjut ke ${type === 'materi' ? 'Pertemuan' : 'Tugas'} Berikutnya →`
                : `Selesaikan Seluruh ${type === 'materi' ? 'Pertemuan' : 'Tugas'} ✓`}
            </button>

            <div>
              {nextItem ? (
                <button
                  type="button"
                  className="btn btn-mist btn-sm"
                  onClick={() => navigate(`/${type}/${nextItem.id}`)}
                >
                  {type === 'materi' ? `Pertemuan ${nextItem.meeting_number}: ` : 'Tugas: '}
                  {nextItem.title.substring(0, 22)}... →
                </button>
              ) : (
                <span className="small text-muted">Akhir daftar.</span>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL LIGHTBOX UNTUK MEMPERBESAR DIAGRAM PEMBELAJARAN */}
      {zoomDiagram && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(20, 40, 63, 0.78)', zIndex: 1060 }}
          onClick={() => setZoomDiagram(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px', overflow: 'hidden' }}>
              <div className="modal-header bg-navy text-white py-3 px-4">
                <div>
                  <h5 className="modal-title h6 fw-bold mb-0 text-white">
                    {zoomDiagram.alt || 'Diagram Modul'}
                  </h5>
                  <div className="small text-white-50" style={{ fontSize: '0.76rem' }}>
                    Visualisasi Analisis &amp; Desain Perangkat Lunak
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setZoomDiagram(null)}
                  aria-label="Tutup"
                ></button>
              </div>

              <div className="modal-body text-center p-4 bg-light" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <img
                  src={zoomDiagram.url}
                  alt={zoomDiagram.alt}
                  className="img-fluid rounded border shadow-sm"
                  style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain' }}
                  onError={(e) => {
                    if (zoomDiagram.fallbackUrl) e.target.src = zoomDiagram.fallbackUrl;
                  }}
                />
                {zoomDiagram.caption && (
                  <p className="small text-muted mt-3 mb-0 fst-italic">
                    {zoomDiagram.caption}
                  </p>
                )}
              </div>

              <div className="modal-footer bg-white py-2 px-4 justify-content-between">
                <span className="small text-muted">Diagram resmi perkuliahan</span>
                <div className="d-flex gap-2">
                  <a
                    href={zoomDiagram.url}
                    download="diagram-materi.png"
                    className="btn btn-ember btn-sm"
                  >
                    Unduh Diagram PNG
                  </a>
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => setZoomDiagram(null)}
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
