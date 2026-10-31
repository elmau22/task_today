import { Router } from 'express';
import { db } from '../db.js';
import { requireRole } from '../auth.js';

const r = Router();
r.get('/', requireRole('admin', 'dosen'), (_req, res) => {
  res.json(db.prepare('SELECT * FROM deletion_logs ORDER BY deleted_at DESC LIMIT 200').all());
});
export default r;
