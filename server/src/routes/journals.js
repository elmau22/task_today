import { Router } from 'express';
import { z } from 'zod';
import { db, uid, nowIso } from '../db.js';
import { requireAuth, requireRole, optionalAuth, isStaff } from '../auth.js';

const r = Router();
const out = (j) => j && { ...j, is_featured: !!j.is_featured };

const schema = z.object({
  title: z.string().trim().min(5, 'Judul minimal 5 karakter').max(300),
  authors: z.string().trim().min(2, 'Penulis wajib diisi').max(300),
  abstract: z.string().trim().max(5000).optional().default(''),
  keywords: z.string().trim().max(300).optional().default(''),
  category: z.string().trim().max(100).optional().default(''),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  volume: z.string().trim().max(20).optional().default(''),
  issue: z.string().trim().max(20).optional().default(''),
  doi: z.string().trim().max(200).optional().default(''),
  file_url: z.string().trim().max(500).optional().default(''),
  cover_url: z.string().trim().max(500).optional().default(''),
});

// Publik: hanya yang terbit. Pengguna masuk dapat memakai ?scope=mine / ?scope=review
r.get('/', optionalAuth, (req, res) => {
  const { scope } = req.query;
  let rows;
  if (scope === 'mine' && req.user) {
    rows = db.prepare('SELECT * FROM journals WHERE owner_id = ? ORDER BY created_at DESC').all(req.user.id);
  } else if (scope === 'review' && isStaff(req.user)) {
    rows = db.prepare('SELECT * FROM journals ORDER BY (status = \'pending\') DESC, created_at DESC').all();
  } else {
    rows = db.prepare("SELECT * FROM journals WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC").all();
  }
  res.json(rows.map(out));
});

r.get('/:id', optionalAuth, (req, res) => {
  const j = db.prepare('SELECT * FROM journals WHERE id = ?').get(req.params.id);
  const allowed = j && (j.status === 'published' || isStaff(req.user) || (req.user && j.owner_id === req.user.id));
  if (!allowed) return res.status(404).json({ error: 'Jurnal tidak ditemukan.' });
  res.json(out(j));
});

r.post('/', requireAuth, (req, res) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  const d = p.data;
  const staff = isStaff(req.user);
  const id = uid();
  // Mahasiswa: menunggu tinjauan dosen/admin. Dosen & admin: langsung terbit.
  db.prepare(`INSERT INTO journals (id,owner_id,title,authors,abstract,keywords,category,year,volume,issue,doi,file_url,cover_url,status,created_at,published_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.user.id, d.title, d.authors, d.abstract, d.keywords, d.category,
      d.year ?? new Date().getFullYear(), d.volume, d.issue, d.doi, d.file_url, d.cover_url,
      staff ? 'published' : 'pending', nowIso(), staff ? nowIso() : null);
  res.status(201).json(out(db.prepare('SELECT * FROM journals WHERE id = ?').get(id)));
});

r.put('/:id', requireAuth, (req, res) => {
  const j = db.prepare('SELECT * FROM journals WHERE id = ?').get(req.params.id);
  if (!j) return res.status(404).json({ error: 'Jurnal tidak ditemukan.' });
  const staff = isStaff(req.user);
  const ownerEditable = j.owner_id === req.user.id && j.status !== 'published';
  if (!staff && !ownerEditable) return res.status(403).json({ error: 'Anda tidak berhak mengubah jurnal ini.' });
  const p = schema.safeParse({ ...j, ...req.body });
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  const d = p.data;
  db.prepare(`UPDATE journals SET title=?,authors=?,abstract=?,keywords=?,category=?,year=?,volume=?,issue=?,doi=?,file_url=?,cover_url=?,
              status = CASE WHEN ? THEN status ELSE 'pending' END WHERE id = ?`)
    .run(d.title, d.authors, d.abstract, d.keywords, d.category, d.year, d.volume, d.issue, d.doi, d.file_url, d.cover_url, staff ? 1 : 0, j.id);
  res.json(out(db.prepare('SELECT * FROM journals WHERE id = ?').get(j.id)));
});

r.patch('/:id/status', requireRole('admin', 'dosen'), (req, res) => {
  const { status, review_note = '', is_featured } = req.body || {};
  if (!['published', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid.' });
  }
  const j = db.prepare('SELECT * FROM journals WHERE id = ?').get(req.params.id);
  if (!j) return res.status(404).json({ error: 'Jurnal tidak ditemukan.' });
  db.prepare('UPDATE journals SET status=?, review_note=?, published_at=?, is_featured=? WHERE id=?')
    .run(status, String(review_note).slice(0, 1000),
      status === 'published' ? (j.published_at || nowIso()) : null,
      is_featured === undefined ? j.is_featured : (is_featured ? 1 : 0), j.id);
  res.json(out(db.prepare('SELECT * FROM journals WHERE id = ?').get(j.id)));
});

r.delete('/:id', requireAuth, (req, res) => {
  const j = db.prepare('SELECT * FROM journals WHERE id = ?').get(req.params.id);
  if (!j) return res.status(404).json({ error: 'Jurnal tidak ditemukan.' });
  const can = isStaff(req.user) || (j.owner_id === req.user.id && j.status !== 'published');
  if (!can) return res.status(403).json({ error: 'Anda tidak berhak menghapus jurnal ini.' });
  db.prepare('INSERT INTO deletion_logs (id,item_type,item_title,deleted_by,reason,deleted_at) VALUES (?,?,?,?,?,?)')
    .run(uid(), 'Jurnal', j.title, `${req.user.name} (${req.user.role})`, String(req.body?.reason || '').slice(0, 500), nowIso());
  db.prepare('DELETE FROM journals WHERE id = ?').run(j.id);
  res.json({ ok: true });
});

export default r;
