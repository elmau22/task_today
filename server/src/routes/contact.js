import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db, uid, nowIso } from '../db.js';
import { requireRole } from '../auth.js';
import { sendContactMail } from '../mailer.js';

const r = Router();
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Terlalu banyak pesan dari alamat ini. Coba lagi nanti.' },
});

const schema = z.object({
  name: z.string().trim().min(2, 'Nama wajib diisi').max(100),
  email: z.string().trim().email('Format email tidak valid').max(200),
  subject: z.string().trim().max(150).optional().default(''),
  message: z.string().trim().min(10, 'Pesan minimal 10 karakter').max(5000),
  website: z.string().optional(), // honeypot
});

r.post('/', limiter, async (req, res) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  if (p.data.website) return res.json({ ok: true }); // bot: pura-pura berhasil
  const { name, email, subject, message } = p.data;
  const id = uid();
  db.prepare('INSERT INTO contact_messages (id,name,email,subject,message,created_at) VALUES (?,?,?,?,?,?)')
    .run(id, name, email, subject, message, nowIso());
  const status = await sendContactMail({ name, email, subject, message });
  db.prepare('UPDATE contact_messages SET mail_status = ? WHERE id = ?').run(status, id);
  res.status(201).json({ ok: true, mail: status });
});

r.get('/', requireRole('admin'), (_req, res) => {
  res.json(db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all().map((m) => ({ ...m, is_read: !!m.is_read })));
});
r.patch('/:id', requireRole('admin'), (req, res) => {
  db.prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?').run(req.body?.is_read ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
r.delete('/:id', requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default r;
