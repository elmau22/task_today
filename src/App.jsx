import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Atmosphere from './components/effects/Atmosphere';

const HomePage = lazy(() => import('./modules/home/HomePage'));
const AssignmentPage = lazy(() => import('./modules/assignments/AssignmentPage'));
const MaterialPage = lazy(() => import('./modules/materials/MaterialPage'));
const BlogPage = lazy(() => import('./modules/blog/BlogPage'));
const BlogDetailPage = lazy(() => import('./modules/blog/BlogDetailPage'));
const ContactPage = lazy(() => import('./modules/contact/ContactPage'));
const LoginPage = lazy(() => import('./modules/admin/LoginPage'));
const DocumentViewerPage = lazy(() => import('./modules/viewer/DocumentViewerPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Atmosphere />
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Suspense
            fallback={
              <div className="container py-5 text-center text-muted">
                <span className="eyebrow mb-3">Portal Pembelajaran</span>
                <p className="mt-2">Memuat halaman...</p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tugas" element={<AssignmentPage />} />
              <Route path="/tugas/:id" element={<DocumentViewerPage type="tugas" />} />
              <Route path="/materi" element={<MaterialPage />} />
              <Route path="/materi/:id" element={<DocumentViewerPage type="materi" />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<LoginPage />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="site-footer">
          <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
            <span>Task Today</span>
            <span>Portal Tugas &amp; Materi Kuliah • Universitas Muhammadiyah Cirebon</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
