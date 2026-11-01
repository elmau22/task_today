import React from 'react';
import ContactForm from '../../components/ContactForm';

export default function ContactPage() {
  return (
    <div className="container pb-5">
      <div className="row g-5">
        <div className="col-lg-5">
          <header className="page-head">
            <h1 className="page-title">Hubungi kami</h1>
            <p className="section-lead">
              Pertanyaan, saran, atau kendala saat memakai portal? Tulis di sini; pesan diteruskan ke{' '}
              <a href="mailto:info@lokalkreatif.com">info@lokalkreatif.com</a>.
            </p>
          </header>
        </div>
        <div className="col-lg-7 pt-lg-5"><ContactForm /></div>
      </div>
    </div>
  );
}
