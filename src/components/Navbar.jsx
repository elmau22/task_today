import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const isLearningActive = pathname === '/tugas' || pathname === '/materi';
  const [user, setUser] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('portal_user_session');
      setUser(saved ? JSON.parse(saved) : null);
    } catch {
      setUser(null);
    }
    // Tutup menu saat pindah rute di layar HP/tablet
    setIsNavOpen(false);
  }, [pathname]);

  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top site-nav">
      <div className="container py-2">
        <Link className="navbar-brand site-brand" to="/" onClick={closeNav}>
          <span className="site-brand-mark" aria-hidden="true" />
          <span>Task Today</span>
        </Link>

        <button
          className={`navbar-toggler nav-toggle ${isNavOpen ? '' : 'collapsed'}`}
          type="button"
          onClick={toggleNav}
          aria-expanded={isNavOpen}
          aria-label="Buka menu navigasi"
        >
          Menu
        </button>

        <div className={`collapse navbar-collapse justify-content-end ${isNavOpen ? 'show' : ''}`} id="navbarNavDropdown">
          <ul className="navbar-nav align-items-lg-center gap-lg-3 gap-xl-4 pt-3 pt-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end onClick={closeNav}>
                Home
              </NavLink>
            </li>

            <li className="nav-item dropdown">
              <a
                className={`nav-link dropdown-toggle ${isLearningActive ? 'active' : ''}`}
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Pembelajaran
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/tugas" onClick={closeNav}>
                    Tugas Perkuliahan
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/materi" onClick={closeNav}>
                    Materi (Pertemuan 1 - Selesai)
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/blog" onClick={closeNav}>
                Blog
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/contact" onClick={closeNav}>
                Contact
              </NavLink>
            </li>

            <li className="nav-item mt-2 mt-lg-0 mb-3 mb-lg-0">
              <Link
                className={`btn py-2 px-3 ${user ? 'btn-ember' : 'btn-mist'}`}
                to="/login"
                onClick={closeNav}
              >
                {user ? `Panel: ${user.name}` : 'Login'}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
