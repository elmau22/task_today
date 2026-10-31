import { Router } from 'express';
import { db, uid, nowIso } from './db.js';
import { requireAuth, requireRole, optionalAuth, isStaff } from './auth.js';

/**
 * Pembuat CRUD generik.
 * - fields: kolom yang boleh diisi klien
 * - bools: kolom boolean (disimpan 0/1)
 * - staffOnlyFields: hanya admin/dosen yang boleh mengubah
 * - canCreate: middleware pembuatan
 * - canModify(user,row): izin ubah/hapus
 */
export function resource({
  table, label, fields, bools = [], staffOnlyFields = [], order = 'created_at DESC',
  canCreate, canModify, required = ['title'], beforeSave,
}) {
  const r = Router();
  const out = (row) => {
    if (!row) return row;
    const o = { ...row };
    for (const b of bools) o[b] = !!o[b];
    return o;
  };
  const pick = (body, user) => {
    const data = {};
    for (const f of fields) {
      if (body[f] === undefined) continue;
      if (staffOnlyFields.includes(f) && !isStaff(user)) continue;
      data[f] = bools.includes(f) ? (body[f] ? 1 : 0) : body[f];
    }
    return data;
  };

  r.get('/', (_req, res) => {
    res.json(db.prepare(`SELECT * FROM ${table} ORDER BY ${order}`).all().map(out));
  });

  r.get('/:id', (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: `${label} tidak ditemukan.` });
    res.json(out(row));
  });

  r.post('/', canCreate, (req, res) => {
    const data = pick(req.body || {}, req.user);
    for (const k of required) {
      if (!data[k] || !String(data[k]).trim()) return res.status(400).json({ error: `Kolom ${k} wajib diisi.` });
    }
    if (beforeSave) beforeSave(data, req, null);
    const row = { id: uid(), owner_id: req.user.id, created_at: nowIso(), ...data };
    const cols = Object.keys(row);
    db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
      .run(...cols.map((c) => row[c]));
    res.status(201).json(out(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(row.id)));
  });

  r.put('/:id', requireAuth, (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: `${label} tidak ditemukan.` });
    if (!canModify(req.user, row)) return res.status(403).json({ error: 'Anda tidak berhak mengubah data ini.' });
    const data = pick(req.body || {}, req.user);
    if (beforeSave) beforeSave(data, req, row);
    const cols = Object.keys(data);
    if (cols.length) {
      db.prepare(`UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(',')} WHERE id = ?`)
        .run(...cols.map((c) => data[c]), row.id);
    }
    res.json(out(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(row.id)));
  });

  r.delete('/:id', requireAuth, (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: `${label} tidak ditemukan.` });
    if (!canModify(req.user, row)) return res.status(403).json({ error: 'Anda tidak berhak menghapus data ini.' });
    const reason = String(req.body?.reason || '').slice(0, 500);
    db.prepare('INSERT INTO deletion_logs (id,item_type,item_title,deleted_by,reason,deleted_at) VALUES (?,?,?,?,?,?)')
      .run(uid(), label, row.title || row.name, `${req.user.name} (${req.user.role})`, reason, nowIso());
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(row.id);
    res.json({ ok: true });
  });

  return r;
}

export { requireRole, optionalAuth };
