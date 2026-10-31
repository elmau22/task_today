import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { db, uid } from './db.js';

export const publicUser = (u) =>
  u && {
    id: u.id,
    name: u.name,
    email: u.email,
    identity_number: u.identity_number,
    role: u.role,
    is_active: !!u.is_active,
    created_at: u.created_at,
  };

export function signAccess(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.accessSecret, {
    expiresIn: config.accessTtl,
    issuer: 'task-today',
  });
}

export function issueRefresh(user) {
  const jti = uid();
  const expires = new Date(Date.now() + config.refreshTtlDays * 864e5);
  db.prepare('INSERT INTO refresh_tokens (id,user_id,expires_at) VALUES (?,?,?)').run(
    jti, user.id, expires.toISOString()
  );
  const token = jwt.sign({ sub: user.id }, config.refreshSecret, {
    expiresIn: `${config.refreshTtlDays}d`,
    jwtid: jti,
    issuer: 'task-today',
  });
  return { token, expires };
}

export const REFRESH_COOKIE = 'tt_refresh';
export const cookieOpts = (expires) => ({
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'strict',
  path: '/api/auth',
  ...(expires && { expires }),
});

function loadUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/** Opsional: isi req.user bila token valid, tanpa menolak request. */
export function optionalAuth(req, _res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try {
      const p = jwt.verify(h.slice(7), config.accessSecret, { issuer: 'task-today' });
      const u = loadUser(p.sub);
      if (u && u.is_active) req.user = u;
    } catch { /* token tidak valid: anggap tamu */ }
  }
  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ error: 'Sesi tidak valid atau telah berakhir.' });
    next();
  });
}

export const requireRole = (...roles) => (req, res, next) =>
  requireAuth(req, res, () => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses untuk tindakan ini.' });
    }
    next();
  });

export const isStaff = (u) => !!u && (u.role === 'admin' || u.role === 'dosen');
