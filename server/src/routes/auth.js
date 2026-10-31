import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db, uid, nowIso } from '../db.js';
import { config } from '../config.js';
import {
  publicUser, signAccess, issueRefresh, requireAuth, REFRESH_COOKIE, cookieOpts,
} from '../auth.js';

const r = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.' },
});

const strongPassword = z.string().min(8, 'Kata sandi minimal 8 karakter').max(100)
  .regex(/[A-Za-z]/, 'Kata sandi harus memuat huruf').regex(/\d/, 'Kata sandi harus memuat angka');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  identity_number: z.string().trim().max(30).optional().default(''),
  password: strongPassword,
});

function startSession(res, user) {
  const { token, expires } = issueRefresh(user);
  res.cookie(REFRESH_COOKIE, token, cookieOpts(expires));
  return { token: signAccess(user), user: publicUser(user) };
}

const fail = (res, e) =>
  res.status(400).json({ error: e.issues?.[0]?.message || 'Data tidak valid.' });

r.post('/register', limiter, (req, res) => {
  const p = registerSchema.safeParse(req.body);
  if (!p.success) return fail(res, p.error);
  const { name, email, identity_number, password } = p.data;
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Email sudah terdaftar.' });
  }
  const id = uid();
  // Pendaftaran publik selalu menjadi mahasiswa. Dosen/admin dibuat oleh admin.
  db.prepare('INSERT INTO users (id,name,email,identity_number,password_hash,role,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, name, email, identity_number, bcrypt.hashSync(password, 12), 'mahasiswa', nowIso());
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.status(201).json(startSession(res, user));
});

const DUMMY_HASH = bcrypt.hashSync('dummy-password-timing', 12);

r.post('/login', limiter, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const ok = bcrypt.compareSync(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok || !user.is_active) {
    return res.status(401).json({ error: 'Email atau kata sandi salah.' });
  }
  res.json(startSession(res, user));
});

r.post('/refresh', (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ error: 'Tidak ada sesi.' });
  try {
    const p = jwt.verify(token, config.refreshSecret, { issuer: 'task-today' });
    const row = db.prepare('SELECT * FROM refresh_tokens WHERE id = ?').get(p.jti);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(p.sub);
    if (!row || row.revoked || !user || !user.is_active) throw new Error('revoked');
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?').run(row.id); // rotasi
    res.json(startSession(res, user));
  } catch {
    res.clearCookie(REFRESH_COOKIE, cookieOpts());
    res.status(401).json({ error: 'Sesi berakhir. Silakan masuk kembali.' });
  }
});

r.post('/logout', (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const p = jwt.verify(token, config.refreshSecret, { ignoreExpiration: true });
      db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?').run(p.jti);
    } catch { /* abaikan */ }
  }
  res.clearCookie(REFRESH_COOKIE, cookieOpts());
  res.json({ ok: true });
});

r.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

r.post('/password', requireAuth, limiter, (req, res) => {
  const np = strongPassword.safeParse(req.body?.new_password);
  if (!np.success) return fail(res, np.error);
  if (!bcrypt.compareSync(String(req.body?.current_password || ''), req.user.password_hash)) {
    return res.status(400).json({ error: 'Kata sandi saat ini salah.' });
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(np.data, 12), req.user.id);
  db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

export default r;
