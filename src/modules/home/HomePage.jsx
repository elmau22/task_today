import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import CampusScene from '../../components/effects/CampusScene';
import Reveal from '../../components/effects/Reveal';
import PdfCoverImage from '../../components/PdfCoverImage';
import ContactForm from '../../components/ContactForm';
import { blogService } from '../../services/blogService';
import { parseItemMetadata } from '../../services/metadataHelper';

const pick = (list) => {
  const featured = list.filter((x) => x.is_featured);
  return (featured.length ? featured : list).slice(0, 3);
};

function SectionHead({ id, title, lead, to, cta }) {
  return (
    <Reveal className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
      <div>
        <h2 className="section-title mb-1" id={id}>{title}</h2>
        {lead && <p className="section-lead mb-0">{lead}</p>}
      </div>
      {to && <Link to={to} className="text-link text-nowrap">{cta} →</Link>}
    </Reveal>
  );
}

function DocCard({ item, to, label }) {
  const meta = parseItemMetadata(item);
  return (
    <Link to={to} className="text-decoration-none d-block h-100">
      <div className="card card-nature h-100 p-3">
        <div className="card-media mb-3">
          <PdfCoverImage
            src={meta.coverUrl || item.cover_url}
            pdfUrl={item.file_url}
            alt={item.title}
            style={{ height: '180px', width: '100%', objectFit: 'cover' }}
            fallback={<div className="p-3 numeral">{label}</div>}
          />
        </div>
        <div className="small text-muted mb-1">{meta.course}</div>
        <h3 className="h6 fw-bold text-navy mb-2">{item.title}</h3>
        <div className="small text-muted mt-auto">
          {item.meeting_number ? `Pertemuan ${item.meeting_number} · ` : item.student_name ? `${item.student_name} · ` : ''}
          {meta.lecturer}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [materials, setMaterials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.get('/materials').then((l) => setMaterials(pick(l))).catch(() => {});
    api.get('/assignments').then((l) => setTasks(pick(l))).catch(() => {});
    api.get('/journals').then((l) => setJournals(l.slice(0, 4))).catch(() => {});
    blogService.getFeatured().then(setBlogs).catch(() => {});
  }, []);

  return (
    <div>
      {/* Cover + tujuan website */}
      <section className="hero">
        <CampusScene />
        <div className="container hero-content py-5">
          <div className="row">
            <div className="col-lg-7 col-xl-6">
              <div className="hero-card">
                <h1 className="hero-title">Task Today</h1>
                <p className="hero-lead mb-4">
                  Tempat dosen membagikan materi per pertemuan, mahasiswa mengumpulkan tugas, dan keduanya
                  menerbitkan tulisan ilmiah, semuanya dalam satu portal yang rapi dan mudah dicari.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <a href="#materi" className="btn btn-ember">Mulai dari materi</a>
                  <Link to="/login" className="btn btn-mist">Masuk / Daftar</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        {/* About */}
        <section id="about" className="row g-5 py-4 py-md-5">
          <Reveal className="col-lg-5">
            <h2 className="section-title">Tentang portal ini</h2>
          </Reveal>
          <Reveal className="col-lg-7" delay={120}>
            <p className="section-lead">
              Task Today dibuat untuk perkuliahan Sistem Informasi di Universitas Muhammadiyah Cirebon.
              Materi disusun berurutan per pertemuan, tugas mahasiswa diarsipkan lengkap dengan dokumennya,
              dan naskah jurnal melewati tinjauan dosen sebelum tampil ke publik.
            </p>
            <p className="mb-0">Ada tiga jenis akun: mahasiswa, dosen, dan admin. <Link to="/pendiri">Kenali pendirinya</Link>.</p>
          </Reveal>
        </section>

        <hr className="divider my-4" />

        <section id="materi" className="py-4">
          <SectionHead title="Materi" lead="Bahan kuliah per pertemuan, bisa dibaca langsung di browser." to="/materi" cta="Semua materi" />
          <div className="row g-4">
            {materials.map((m) => (
              <div className="col-12 col-md-6 col-lg-4" key={m.id}><DocCard item={m} to={`/materi/${m.id}`} label={`P${m.meeting_number}`} /></div>
            ))}
            {materials.length === 0 && <p className="text-muted">Belum ada materi.</p>}
          </div>
        </section>

        <section id="tugas" className="py-5">
          <SectionHead title="Tugas" lead="Arsip tugas mahasiswa dari semua mata kuliah." to="/tugas" cta="Semua tugas" />
          <div className="row g-4">
            {tasks.map((t) => (
              <div className="col-12 col-md-6 col-lg-4" key={t.id}><DocCard item={t} to={`/tugas/${t.id}`} label="Tugas" /></div>
            ))}
            {tasks.length === 0 && <p className="text-muted">Belum ada tugas.</p>}
          </div>
        </section>

        <section id="jurnal" className="py-4">
          <SectionHead title="Jurnal" lead="Publikasi terbaru dari dosen dan mahasiswa." to="/jurnal" cta="Semua jurnal" />
          <ol className="journal-list">
            {journals.map((j) => (
              <li key={j.id} className="journal-item">
                <div className="small text-muted">{[j.category, j.year].filter(Boolean).join(' · ')}</div>
                <h3 className="h6 mb-1"><Link to={`/jurnal/${j.id}`}>{j.title}</Link></h3>
                <div className="small">{j.authors}</div>
              </li>
            ))}
          </ol>
          {journals.length === 0 && <p className="text-muted">Belum ada jurnal yang terbit.</p>}
        </section>

        <section id="blog" className="py-5">
          <SectionHead title="Blog" lead="Catatan singkat seputar analisis dan desain sistem." to="/blog" cta="Semua tulisan" />
          <div className="row g-4">
            {blogs.map((b) => (
              <div className="col-12 col-md-6 col-lg-4" key={b.id}>
                <Link to={`/blog/${b.id}`} className="text-decoration-none d-block h-100">
                  <div className="card card-nature h-100 p-3">
                    {b.cover_url && <img src={b.cover_url} alt="" className="mb-3" style={{ height: 160, objectFit: 'cover', width: '100%' }} loading="lazy" />}
                    <div className="small text-muted mb-1">{b.category} · {b.read_time}</div>
                    <h3 className="h6 fw-bold text-navy mb-2">{b.title}</h3>
                    <p className="small text-muted mb-0 clamp-2">{b.summary}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider my-4" />

        <section id="contact" className="row g-5 py-5">
          <Reveal className="col-lg-5">
            <h2 className="section-title">Contact person</h2>
            <p className="section-lead">
              Tulis pesan untuk kami. Pesan masuk ke <a href="mailto:info@lokalkreatif.com">info@lokalkreatif.com</a>.
            </p>
          </Reveal>
          <Reveal className="col-lg-7" delay={120}><ContactForm /></Reveal>
        </section>
      </div>
    </div>
  );
}
