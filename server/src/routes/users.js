import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, uid, nowIso } from '../db.js';
import { requireRole, publicUser } from '../auth.js';

const r = Router();
r.use(requireRole('admin'));

const ROLES = ['admin', 'dosen', 'mahasiswa'];
const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  identity_number: z.string().trim().max(30).optional().default(''),
  role: z.enum(ROLES),
  password: z.string().min(8).max(100),
});

r.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(publicUser));
});

r.post('/', (req, res) => {
  const p = createSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  const d = p.data;
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(d.email)) {
    return res.status(409).json({ error: 'Email sudah terdaftar.' });
  }
  const id = uid();
  db.prepare('INSERT INTO users (id,name,email,identity_number,password_hash,role,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, d.name, d.email, d.identity_number, bcrypt.hashSync(d.password, 12), d.role, nowIso());
  res.status(201).json(publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id)));
});

r.patch('/:id', (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  const b = req.body || {};
  const self = u.id === req.user.id;
  const sets = {};
  if (b.name) sets.name = String(b.name).trim().slice(0, 100);
  if (b.identity_number !== undefined) sets.identity_number = String(b.identity_number).slice(0, 30);
  if (b.role !== undefined) {
    if (!ROLES.includes(b.role)) return res.status(400).json({ error: 'Peran tidak valid.' });
    if (self && b.role !== 'admin') return res.status(400).json({ error: 'Anda tidak dapat menurunkan peran akun sendiri.' });
    sets.role = b.role;
  }
  if (b.is_active !== undefined) {
    if (self && !b.is_active) return res.status(400).json({ error: 'Anda tidak dapat menonaktifkan akun sendiri.' });
    sets.is_active = b.is_active ? 1 : 0;
  }
  if (b.password) {
    if (String(b.password).length < 8) return res.status(400).json({ error: 'Kata sandi minimal 8 karakter.' });
    sets.password_hash = bcrypt.hashSync(String(b.password), 12);
  }
  const cols = Object.keys(sets);
  if (cols.length) {
    db.prepare(`UPDATE users SET ${cols.map((c) => `${c} = ?`).join(',')} WHERE id = ?`).run(...cols.map((c) => sets[c]), u.id);
    if (sets.role || sets.password_hash || sets.is_active === 0) {
      db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(u.id);
    }
  }
  res.json(publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(u.id)));
});

r.delete('/:id', (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Anda tidak dapat menghapus akun sendiri.' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default r;
