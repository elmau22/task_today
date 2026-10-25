import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import SplitText from '../../components/effects/SplitText';
import Reveal from '../../components/effects/Reveal';

export default function BlogPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    const list = await blogService.getAll();
    setBlogs(list);
  }

  const categories = ['Semua', 'Analisis Sistem', 'Metodologi', 'Tips Kuliah'];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCategory =
      selectedCategory === 'Semua' || b.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container pb-5">
      <header className="page-head">
        <span className="eyebrow fade-up">Catatan &amp; Wawasan</span>
        <SplitText as="h1" className="page-title" text="Blog Pembelajaran" delay={150} stagger={40} />
        <p className="section-lead fade-up" style={{ animationDelay: '800ms' }}>
          Arsip artikel, catatan analisis sistem, serta wawasan akademis untuk memperkuat pemahaman perkuliahan.
        </p>
      </header>

      {/* Kontrol Pencarian & Kategori Filter */}
      <Reveal className="panel p-3 p-md-4 mb-5">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Cari artikel atau topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari artikel blog"
            />
          </div>
          <div className="col-12 col-md-7 d-flex flex-wrap gap-2 justify-content-md-end">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-quiet ${selectedCategory === cat ? 'is-on' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Grid Kartu Blog */}
      <div className="row g-4">
        {filteredBlogs.map((blog, i) => (
          <Reveal key={blog.id} className="col-12 col-md-6 col-lg-4" delay={(i % 3) * 120}>
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
                    style={{ height: '190px', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              )}

              <div className="card-body p-1 d-flex flex-column justify-content-between flex-grow-1">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="tag tag-ember">{blog.category || 'Artikel'}</span>
                    <span className="small text-muted">{blog.read_time || '3 menit'}</span>
                  </div>

                  <h5 className="card-title fw-bold mb-2 text-navy" style={{ lineHeight: 1.3 }}>
                    {blog.title}
                  </h5>

                  <p className="card-text small text-muted mb-3" style={{ lineHeight: 1.6 }}>
                    {blog.summary || blog.content.substring(0, 110) + '...'}
                  </p>
                </div>

                <div className="pt-2 border-top d-flex justify-content-between align-items-center mt-auto">
                  <span className="small text-muted">Oleh {blog.author || 'Mohamad Farael Maulana'}</span>
                  <Link
                    to={`/blog/${blog.id}`}
                    className="text-link fw-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Baca Selengkapnya →
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        {filteredBlogs.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            Tidak ada artikel blog yang sesuai dengan pencarian atau filter yang dipilih.
          </div>
        )}
      </div>
    </div>
  );
}
