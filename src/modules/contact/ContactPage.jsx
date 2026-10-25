import React, { useState } from 'react';
import SplitText from '../../components/effects/SplitText';
import Reveal from '../../components/effects/Reveal';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendEmail = (e) => {
    e.preventDefault();
    const mailtoLink = `mailto:dosen@kampus.ac.id?subject=${encodeURIComponent(
      `[Analisis & Desain] ${subject} - ${name}`
    )}&body=${encodeURIComponent(`Pengirim: ${name} (${email})\n\nPesan:\n${message}`)}`;

    window.location.href = mailtoLink;
    setSent(true);
  };

  return (
    <div className="container pb-5">
      <div className="row g-5 justify-content-between">
        <div className="col-lg-5">
          <header className="page-head">
            <span className="eyebrow fade-up">Contact Email</span>
            <SplitText as="h1" className="page-title" text="Mari berbincang" delay={150} stagger={45} />
            <p className="section-lead fade-up" style={{ animationDelay: '900ms' }}>
              Hubungi pengampu mata kuliah Analisis dan Desain atau laporkan kendala pengumpulan tugas.
            </p>
          </header>
        </div>

        <div className="col-lg-7 pt-lg-5">
          <Reveal className="panel p-4 p-md-5 mt-lg-5" delay={200}>
            {sent && (
              <div className="notice mb-4">
                Aplikasi email Anda telah dibuka untuk mengirim pesan.
              </div>
            )}

            <form onSubmit={handleSendEmail}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nama Mahasiswa"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Alamat Email Anda</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="nama@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Subjek</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Konfirmasi Pengumpulan Tugas Kelompok 2"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Pesan</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Tuliskan pesan Anda..."
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-ember w-100">
                    Kirim Pesan Email
                  </button>
                </div>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
