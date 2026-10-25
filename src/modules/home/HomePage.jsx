import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import SplitText from '../../components/effects/SplitText';
import Reveal from '../../components/effects/Reveal';
import LeafCanvas from '../../components/effects/LeafCanvas';
import CampusScene from '../../components/effects/CampusScene';
import { blogService } from '../../services/blogService';
import { parseItemMetadata } from '../../services/metadataHelper';
import PdfCoverImage from '../../components/PdfCoverImage';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredTasks, setFeaturedTasks] = useState([]);
  const [featuredMaterials, setFeaturedMaterials] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);

  useEffect(() => {
    fetchMemorialData();
    fetchBlogData();
  }, []);

  async function fetchMemorialData() {
    try {
      // 1. Ambil tugas pilihan (is_featured), atau fallback ke tugas terbaru
      const { data: tasks } = await supabase
        .from('assignments')
        .select('*')
        .eq('is_featured', true)
        .limit(3);

      if (tasks && tasks.length > 0) {
        setFeaturedTasks(tasks);
      } else {
        const { data: latestTasks } = await supabase
          .from('assignments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        if (latestTasks) setFeaturedTasks(latestTasks);
      }

      // 2. Ambil materi pilihan (is_featured), atau fallback ke materi pertemuan pertama
      const { data: materials } = await supabase
        .from('materials')
        .select('*')
        .eq('is_featured', true)
        .order('meeting_number', { ascending: true })
        .limit(3);

      if (materials && materials.length > 0) {
        setFeaturedMaterials(materials);
      } else {
        const { data: allMats } = await supabase
          .from('materials')
          .select('*')
          .order('meeting_number', { ascending: true })
          .limit(3);
        if (allMats) setFeaturedMaterials(allMats);
      }
    } catch (err) {
      console.error('Error fetching memorial data:', err);
    }
  }

  async function fetchBlogData() {
    try {
      const blogs = await blogService.getFeatured();
      setFeaturedBlogs(blogs);
    } catch (err) {
      console.error('Error fetching featured blogs:', err);
    }
  }

  return (
    <div>
      {/* ================= HERO UTAMA (SEDERHANA & BERSIH) ================= */}
      <section className="hero">
        <CampusScene />
        <LeafCanvas leafCount={10} dustCount={18} butterflies={2} palette="green" />

        <div className="container hero-content py-5">
          <div className="row">
            <div className="col-lg-7 col-xl-6">
              <div className="hero-card">
                <span className="eyebrow fade-up" style={{ animationDelay: '100ms' }}>
                  Portal Pembelajaran
                </span>

                <h1 className="hero-title">
                  <SplitText text="Task Today" delay={300} stagger={45} />
                  <br />
                  <em>
                    <SplitText text="Portal Tugas & Materi" delay={900} stagger={40} />
                  </em>
                </h1>

                <p className="hero-lead mb-4 fade-up" style={{ animationDelay: '1700ms' }}>
                  Ruang pengumpulan tugas, arsip materi perkuliahan seluruh mata kuliah, dan catatan blog informatif. Belajar dengan
                  tenang, seteduh halaman kampus di bawah langit yang cerah.
                </p>

                <div className="d-flex flex-wrap gap-2 gap-sm-3 fade-up" style={{ animationDelay: '2000ms' }}>
                  <Link to="/tugas" className="btn btn-ember">
                    Lihat Tugas
                  </Link>
                  <Link to="/materi" className="btn btn-mist">
                    Lihat Materi
                  </Link>
                  <Link to="/blog" className="btn btn-mist">
                    Baca Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        {/* ================= TENTANG PORTAL (ABOUT) ================= */}
        <section className="row g-5 align-items-center py-4 py-md-5 mb-4">
          <Reveal className="col-lg-5">
            <span className="eyebrow">About</span>
            <h2 className="section-title">Belajar dengan langkah yang tenang</h2>
          </Reveal>
          <Reveal className="col-lg-7" delay={150}>
            <p className="about-quote mb-4">
              Setiap pertemuan disusun berurutan, dari yang pertama hingga selesai.
            </p>
            <p className="section-lead mb-0">
              Portal ini memfasilitasi mahasiswa dalam menyimak tugas perkuliahan (PPT, Excel, PDF, Video YouTube, dan Gambar), mengakses materi per pertemuan secara berurutan, serta membaca artikel blog seputar sistem informasi dalam nuansa kampus yang sejuk dan bersahabat.
            </p>
          </Reveal>
        </section>

        <hr className="divider my-5" />

        {/* ================= SECTION BLOG ================= */}
        <section className="py-4">
          <Reveal className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
            <div>
              <span className="eyebrow">Blog &amp; Wawasan</span>
              <h2 className="section-title mb-1">Catatan Analisis Terkini</h2>
              <p className="section-lead mb-0">
                Wawasan praktis dan panduan perkuliahan yang diperbarui secara berkala.
              </p>
            </div>
            <Link to="/blog" className="btn btn-mist align-self-start align-self-md-end">
              Lihat Semua Blog
            </Link>
          </Reveal>

          <div className="row g-4">
            {featuredBlogs.map((blog, i) => (
              <Reveal key={blog.id} className="col-12 col-md-6 col-lg-4" delay={i * 120}>
                <div
                  className="card card-nature h-100 p-3 clickable d-flex flex-column"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  title={`Buka artikel: ${blog.title}`}
                >
                  {blog.cover_url && (
                    <div className="card-media mb-3">
                      <img
                        src={blog.cover_url}
                        alt={blog.title}
                        style={{ height: '180px', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="card-body p-1 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="tag tag-ember">{blog.category}</span>
                        <span className="small text-muted">{blog.read_time}</span>
                      </div>
                      <h5 className="card-title fw-bold mb-2 text-navy" style={{ lineHeight: 1.35 }}>
                        {blog.title}
                      </h5>
                      <p className="card-text small text-muted mb-3" style={{ lineHeight: 1.6 }}>
                        {blog.summary}
                      </p>
                    </div>
                    <div className="pt-2 border-top d-flex justify-content-between align-items-center mt-auto">
                      <span className="small text-muted">Oleh {blog.author}</span>
                      <Link
                        to={`/blog/${blog.id}`}
                        className="text-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Baca Selengkapnya →
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}

            {featuredBlogs.length === 0 && (
              <div className="col-12 py-4 text-muted">
                Belum ada artikel blog yang ditonjolkan di halaman depan.
              </div>
            )}
          </div>
        </section>

        <hr className="divider my-5" />

        {/* ================= SECTION MEMORIAL (TUGAS & MATERI PILIHAN) ================= */}
        <section className="py-4">
          <Reveal className="mb-5">
            <span className="eyebrow">Memorial</span>
            <h2 className="section-title">Tugas &amp; Materi Pilihan</h2>
            <p className="section-lead">
              Karya tugas dan materi pilihan yang ditonjolkan sebagai referensi utama perkuliahan.
            </p>
          </Reveal>

          <div className="row g-4">
            {featuredTasks.map((task, i) => {
              const meta = parseItemMetadata(task.description);
              return (
                <Reveal key={task.id} className="col-12 col-md-6 col-lg-4" delay={i * 120}>
                  <Link to={`/tugas/${task.id}`} className="text-decoration-none d-block h-100">
                    <div className="card card-nature h-100 p-3">
                      <div className="card-media mb-3">
                        <PdfCoverImage
                          src={task.cover_url}
                          pdfUrl={task.file_url}
                          alt={task.title}
                          style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="card-body p-1 d-flex flex-column justify-content-between flex-grow-1">
                        <div>
                          <div className="mb-2">
                            <span className="tag tag-ember" style={{ fontSize: '0.72rem' }}>{meta.course}</span>
                          </div>
                          <h5
                            className="card-title fw-semibold text-navy mb-2"
                            style={{ lineHeight: 1.4, fontSize: '1.05rem', wordBreak: 'break-word' }}
                          >
                            {task.title}
                          </h5>
                          <div className="d-flex flex-column gap-1 mb-2">
                            <div className="small text-secondary" style={{ fontSize: '0.82rem', lineHeight: 1.35 }}>
                              Dosen: <strong>{meta.lecturer}</strong>
                            </div>
                            <div className="small text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                              Oleh <strong>{task.student_name}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}

            {featuredMaterials.map((mat, i) => {
              const meta = parseItemMetadata(mat.description);
              return (
                <Reveal
                  key={mat.id}
                  className="col-12 col-md-6 col-lg-4"
                  delay={(featuredTasks.length + i) * 120}
                >
                  <Link to={`/materi/${mat.id}`} className="text-decoration-none d-block h-100">
                    <div className="card card-nature h-100 p-3">
                      <div className="card-media mb-3" style={{ position: 'relative' }}>
                        <PdfCoverImage
                          src={meta.coverUrl || mat.cover_url}
                          pdfUrl={mat.file_url}
                          alt={mat.title}
                          style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                          fallback={
                            <div className="d-flex align-items-baseline gap-3 mb-2 p-2">
                              <span className="numeral">{String(mat.meeting_number).padStart(2, '0')}</span>
                              <span className="numeral-label">Pertemuan</span>
                            </div>
                          }
                        />
                        <span
                          className="tag tag-ember"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            fontSize: '0.68rem',
                            boxShadow: '1.5px 1.5px 0 var(--navy)',
                          }}
                        >
                          P-{mat.meeting_number}
                        </span>
                      </div>
                      <div className="card-body p-1 d-flex flex-column justify-content-between flex-grow-1">
                        <div>
                          <div className="mb-2">
                            <span className="tag tag-ember" style={{ fontSize: '0.72rem' }}>{meta.course}</span>
                          </div>
                          <h5
                            className="card-title fw-semibold text-navy mb-2"
                            style={{ lineHeight: 1.4, fontSize: '1.05rem', wordBreak: 'break-word' }}
                          >
                            {mat.title}
                          </h5>
                          <div className="d-flex flex-column gap-1 mb-2">
                            <div className="small text-secondary" style={{ fontSize: '0.82rem', lineHeight: 1.35 }}>
                              Dosen: <strong>{meta.lecturer}</strong>
                            </div>
                          </div>
                          {meta.cleanDescription && (
                            <p
                              className="card-text small text-muted mb-0"
                              style={{
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word',
                              }}
                            >
                              {meta.cleanDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}

            {featuredTasks.length === 0 && featuredMaterials.length === 0 && (
              <div className="col-12 py-4 text-muted">
                Belum ada tugas atau materi yang ditonjolkan di bagian Memorial.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
