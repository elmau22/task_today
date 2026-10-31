import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { requireAuth } from '../auth.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const ALLOWED = new Set(['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.gif']);

const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadDir,
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Tipe berkas tidak diizinkan.')),
});

const r = Router();
r.post('/', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Berkas tidak ditemukan.' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});
export default r;
