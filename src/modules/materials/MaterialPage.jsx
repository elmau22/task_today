import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import PreviewModal from '../../components/PreviewModal';
import SplitText from '../../components/effects/SplitText';
import Reveal from '../../components/effects/Reveal';
import { parseItemMetadata } from '../../services/metadataHelper';
import PdfCoverImage from '../../components/PdfCoverImage';

export default function MaterialPage() {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCourse, setSelectedCourse] = useState(() => searchParams.get('course') || 'Semua Mata Kuliah');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    const c = searchParams.get('course');
    const q = searchParams.get('q');
    if (c) setSelectedCourse(c);
    if (q !== null && q !== undefined) setSearchQuery(q);
  }, [searchParams]);

  async function fetchMaterials() {
    try {
      const { data } = await supabase
        .from('materials')
        .select('*')
        .order('meeting_number', { ascending: true });
      if (data) setMaterials(data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  }

  // Parse metadata (Mata Kuliah, Dosen, Prodi, Universitas)
  const parsedMaterials = materials.map((m) => parseItemMetadata(m));

  // Daftar unik mata kuliah yang tersimpan
  const courseList = [
    'Semua Mata Kuliah',
    ...new Set(parsedMaterials.map((m) => m.course).filter(Boolean)),
  ];

  const filteredMaterials = parsedMaterials.filter((m) => {
    const matchesCourse =
      selectedCourse === 'Semua Mata Kuliah' || m.course === selectedCourse;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.title?.toLowerCase().includes(q) ||
      m.course?.toLowerCase().includes(q) ||
      m.lecturer?.toLowerCase().includes(q) ||
      m.prodi?.toLowerCase().includes(q) ||
      m.cleanDescription?.toLowerCase().includes(q) ||
      String(m.meeting_number).includes(q);

    return matchesCourse && matchesSearch;
  });

  return (
    <div className="container pb-5">
      <header className="page-head">
        <span className="eyebrow fade-up">Task Today</span>
        <SplitText as="h1" className="page-title" text="Materi Perkuliahan" delay={150} stagger={40} />
        <p className="section-lead fade-up" style={{ animationDelay: '800ms' }}>
          Arsip modul materi perkuliahan dari seluruh mata kuliah yang Anda tempuh, disusun per pertemuan secara sistematis.
        </p>
      </header>

      {/* Banner Akses Upload Materi di Login */}
      <Reveal className="panel p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <span className="tag tag-ember mb-2">Kelola Materi</span>
            <h3 className="h5 fw-bold mb-1">Ingin menambah atau memperbarui modul perkuliahan?</h3>
            <p className="text-muted small mb-0">
              Formulir unggah modul materi untuk semua mata kuliah tersedia di menu Login.
            </p>
          </div>
          <Link to="/login" className="btn btn-ember text-nowrap">
            Buka Form Materi (Login)
          </Link>
        </div>
      </Reveal>

      {/* Kontrol Pencarian & Filter Mata Kuliah */}
      <Reveal className="panel p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-bold text-navy mb-1">Cari Modul Materi</label>
            <input
              type="text"
              className="form-control"
              placeholder="Cari judul materi, topik, mata kuliah, dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-7 d-flex align-items-end justify-content-md-end flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ember btn-sm"
              onClick={() => window.print()}
              title="Cetak atau simpan seluruh silabus materi ke PDF"
            >
              Cetak Silabus Materi (PDF)
            </button>
            <div className="ms-2">
              <span className="numeral-label d-block text-end mb-0" style={{ fontSize: '0.72rem' }}>
                Total Modul
              </span>
              <span className="numeral">{String(filteredMaterials.length).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Filter Tombol Mata Kuliah */}
          {courseList.length > 1 && (
            <div className="col-12 pt-2 border-top">
              <span className="small text-muted me-2 fw-semibold">Pilih Mata Kuliah:</span>
              <div className="d-inline-flex flex-wrap gap-1 mt-1">
                {courseList.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`btn btn-quiet btn-sm ${selectedCourse === c ? 'is-on' : ''}`}
                    onClick={() => setSelectedCourse(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* Daftar Materi Berurutan */}
      <div className="d-flex flex-column gap-3">
        {filteredMaterials.map((mat, i) => (
          <Reveal key={mat.id} delay={Math.min(i, 6) * 70}>
            <div
              className="card card-nature material-row clickable"
              onClick={() => setSelectedMaterial(mat)}
              title={`Buka materi: ${mat.title}`}
            >
              <div className="d-flex align-items-center me-md-3" style={{ flexShrink: 0 }}>
                <div className="card-media" style={{ width: '130px', height: '92px', position: 'relative' }}>
                  <PdfCoverImage
                    src={mat.coverUrl || mat.cover_url}
                    pdfUrl={mat.file_url}
                    alt={mat.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    fallback={
                      <div className="p-2 text-center">
                        <div className="numeral-label mb-1">Pertemuan</div>
                        <div className="numeral">{String(mat.meeting_number).padStart(2, '0')}</div>
                      </div>
                    }
                  />
                  <span
                    className="tag tag-ember"
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '4px',
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      boxShadow: '1px 1px 0 var(--navy)',
                    }}
                  >
                    P-{mat.meeting_number}
                  </span>
                </div>
              </div>

              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <span className="tag tag-ember" style={{ fontSize: '0.7rem' }}>
                    {(mat.file_type || 'PDF').toUpperCase()}
                  </span>
                  <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                    {mat.prodi}
                  </span>
                </div>

                <h5
                  className="fw-bold mb-2 text-navy"
                  style={{ lineHeight: 1.4, fontSize: '1.15rem', wordBreak: 'break-word' }}
                >
                  {mat.title}
                </h5>

                {/* SUBTITLE: MATA KULIAH, DOSEN PENGAMPU, PRODI & UNIVERSITAS */}
                <div className="d-flex flex-column gap-1 mb-2">
                  <div
                    className="fw-bold"
                    style={{ fontSize: '0.86rem', color: 'var(--ember)', lineHeight: 1.35 }}
                  >
                    {mat.course}
                  </div>

                  <div className="text-muted small" style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
                    Dosen Pengampu: <strong>{mat.lecturer}</strong> • {mat.university}
                  </div>
                </div>

                {mat.cleanDescription && (
                  <p className="text-muted small mb-0" style={{ lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {mat.cleanDescription.substring(0, 160)}...
                  </p>
                )}
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2 justify-self-start justify-self-md-end mt-2 mt-md-0">
                <Link
                  to={`/materi/${mat.id}`}
                  className="btn btn-sm btn-ember text-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  Buka Dokumen Lengkap
                </Link>
                <button
                  type="button"
                  className="text-link small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMaterial(mat);
                  }}
                >
                  Pratinjau Cepat
                </button>
              </div>
            </div>
          </Reveal>
        ))}

        {filteredMaterials.length === 0 && (
          <div className="text-center py-5 text-muted panel p-5">
            Belum ada modul materi perkuliahan untuk filter yang Anda pilih.
            {selectedCourse !== 'Semua Mata Kuliah' && (
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => setSelectedCourse('Semua Mata Kuliah')}
                >
                  Tampilkan Semua Mata Kuliah
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <PreviewModal
        item={selectedMaterial}
        itemType="Materi"
        onClose={() => setSelectedMaterial(null)}
      />
    </div>
  );
}
