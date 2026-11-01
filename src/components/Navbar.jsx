import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/pendiri', label: 'Pendiri' },
  { to: '/materi', label: 'Materi' },
  { to: '/tugas', label: 'Tugas' },
  { to: '/jurnal', label: 'Jurnal' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => { setIsNavOpen(false); }, [pathname]);

  return (
    <nav className="navbar navbar-expand-lg sticky-top site-nav">
      <div className="container py-2">
        <Link className="navbar-brand site-brand" to="/">
          <span className="site-brand-mark" aria-hidden="true" />
          <span>Task Today</span>
        </Link>

        <button
          className={`navbar-toggler nav-toggle ${isNavOpen ? '' : 'collapsed'}`}
          type="button"
          onClick={() => setIsNavOpen((v) => !v)}
          aria-expanded={isNavOpen}
          aria-label="Buka menu navigasi"
        >
          Menu
        </button>

        <div className={`collapse navbar-collapse justify-content-end ${isNavOpen ? 'show' : ''}`}>
          <ul className="navbar-nav align-items-lg-center gap-lg-3 gap-xl-4 pt-3 pt-lg-0">
            {LINKS.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink className="nav-link" to={l.to} end={l.end}>{l.label}</NavLink>
              </li>
            ))}
            <li className="nav-item mt-2 mt-lg-0 mb-3 mb-lg-0">
              <Link className={`btn py-2 px-3 ${user ? 'btn-ember' : 'btn-mist'}`} to={user ? '/dashboard' : '/login'}>
                {user ? user.name.split(' ')[0] : 'Login'}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
