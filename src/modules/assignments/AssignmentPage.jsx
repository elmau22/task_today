import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import PreviewModal from '../../components/PreviewModal';
import SplitText from '../../components/effects/SplitText';
import Reveal from '../../components/effects/Reveal';
import { parseItemMetadata } from '../../services/metadataHelper';
import PdfCoverImage from '../../components/PdfCoverImage';

export default function AssignmentPage() {
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCourse, setSelectedCourse] = useState(() => searchParams.get('course') || 'Semua Mata Kuliah');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    const c = searchParams.get('course');
    const q = searchParams.get('q');
    if (c) setSelectedCourse(c);
    if (q !== null && q !== undefined) setSearchQuery(q);
  }, [searchParams]);

  async function fetchAssignments() {
    try {
      const { data } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  }

  // Parse metadata (Mata Kuliah, Dosen, Prodi, Universitas)
  const parsedAssignments = assignments.map((a) => parseItemMetadata(a));

  // Daftar unik mata kuliah yang tersimpan
  const courseList = [
    'Semua Mata Kuliah',
    ...new Set(parsedAssignments.map((a) => a.course).filter(Boolean)),
  ];

  const filteredTasks = parsedAssignments.filter((t) => {
    const matchesCourse =
      selectedCourse === 'Semua Mata Kuliah' || t.course === selectedCourse;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.title?.toLowerCase().includes(q) ||
      t.student_name?.toLowerCase().includes(q) ||
      t.course?.toLowerCase().includes(q) ||
      t.lecturer?.toLowerCase().includes(q) ||
      t.prodi?.toLowerCase().includes(q) ||
      t.file_type?.toLowerCase().includes(q);

    return matchesCourse && matchesSearch;
  });

  return (
    <div className="container pb-5">
      <header className="page-head">
        <span className="eyebrow fade-up">Task Today</span>
        <SplitText as="h1" className="page-title" text="Arsip Tugas Perkuliahan" delay={150} stagger={40} />
        <p className="section-lead fade-up" style={{ animationDelay: '800ms' }}>
          Pusat penyimpanan tugas dan karya akademik dari seluruh mata kuliah yang Anda tempuh. Klik pada kartu tugas untuk membuka dokumen lengkap.
        </p>
      </header>

      {/* Banner Ajakan Akses Form Pengumpulan di Login */}
      <Reveal className="panel p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <span className="tag tag-ember mb-2">Kelola Tugas</span>
            <h3 className="h5 fw-bold mb-1">Ingin mengumpulkan atau mengedit tugas baru?</h3>
            <p className="text-muted small mb-0">
              Formulir pengumpulan tugas dari semua mata kuliah tersedia di menu Login.
            </p>
          </div>
          <Link to="/login" className="btn btn-ember text-nowrap">
            Buka Form Tugas (Login)
          </Link>
        </div>
      </Reveal>

      {/* Kontrol Pencarian & Filter Mata Kuliah */}
      <Reveal className="panel p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-bold text-navy mb-1">Cari Tugas</label>
            <input
              type="text"
              className="form-control"
              placeholder="Cari berdasarkan judul, nama mahasiswa, mata kuliah, dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-7 d-flex align-items-end justify-content-md-end flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ember btn-sm"
              onClick={() => window.print()}
              title="Cetak atau simpan seluruh rekap tugas mahasiswa ke PDF"
            >
              Cetak Rekap Tugas (PDF)
            </button>
            <div className="ms-2">
              <span className="numeral-label d-block text-end mb-0" style={{ fontSize: '0.72rem' }}>
                Total Tugas
              </span>
              <span className="numeral">{String(filteredTasks.length).padStart(2, '0')}</span>
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

      {/* Grid Kartu Tugas */}
      <div className="row g-4">
        {filteredTasks.map((task, i) => (
          <Reveal key={task.id} className="col-12 col-sm-6 col-md-4 col-lg-3" delay={(i % 4) * 80}>
            <div
              className="card card-nature h-100 p-3 clickable d-flex flex-column"
              onClick={() => setSelectedTask(task)}
              title={`Buka tugas: ${task.title}`}
            >
              <div className="card-media mb-3">
                <PdfCoverImage
                  src={task.cover_url}
                  pdfUrl={task.file_url}
                  alt={task.title}
                  style={{ height: '160px', width: '100%', objectFit: 'cover' }}
                />
              </div>

              <div className="card-body p-1 d-flex flex-column justify-content-between flex-grow-1">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                    <span className="tag tag-ember" style={{ fontSize: '0.68rem' }}>
                      {task.file_type?.toUpperCase() || 'DOKUMEN'}
                    </span>
                    <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                      {task.prodi}
                    </span>
                  </div>

                  <h5 className="card-title fw-bold mb-2 text-navy" style={{ fontSize: '1rem', lineHeight: 1.4 }}>
                    {task.title}
                  </h5>

                  {/* SUBTITLE: MATA KULIAH, DOSEN PENGAMPU, PRODI & UNIVERSITAS */}
                  <div className="d-flex flex-column gap-1 mb-3">
                    <div
                      className="fw-bold"
                      style={{ fontSize: '0.82rem', color: 'var(--ember)', lineHeight: 1.35 }}
                    >
                      {task.course}
                    </div>

                    <div className="small text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                      Dosen: <strong>{task.lecturer}</strong>
                    </div>

                    <div className="small text-muted" style={{ fontSize: '0.74rem', lineHeight: 1.35 }}>
                      {task.university}
                    </div>

                    <div
                      className="small text-dark p-1 px-2 rounded mt-1"
                      style={{ background: '#f5f5f5', fontSize: '0.75rem', lineHeight: 1.35 }}
                    >
                      Mahasiswa: <strong>{task.student_name}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-top d-flex flex-column gap-2 mt-auto">
                  <Link
                    to={`/tugas/${task.id}`}
                    className="btn btn-sm btn-ember text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Buka Dokumen Lengkap
                  </Link>
                  <button
                    type="button"
                    className="text-link small text-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                    }}
                  >
                    Pratinjau Cepat
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        {filteredTasks.length === 0 && (
          <div className="col-12 text-center py-5 text-muted panel p-5">
            Belum ada tugas perkuliahan yang sesuai dengan mata kuliah atau kata kunci yang dipilih.
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
        item={selectedTask}
        itemType="Tugas"
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
