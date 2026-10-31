import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { seedAdmin, seedBlogs } from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import { assignments, materials, blogs, founders } from './routes/content.js';
import journalRoutes from './routes/journals.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/uploads.js';
import logRoutes from './routes/logs.js';

seedAdmin();
await seedBlogs();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // frontend memuat font Google & penampil dokumen eksternal
}));
app.use(cors({ origin: config.clientOrigin.split(','), credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(config.uploadDir, {
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignments);
app.use('/api/materials', materials);
app.use('/api/blogs', blogs);
app.use('/api/founders', founders);
app.use('/api/journals', journalRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/logs', logRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));

// Produksi satu server: sajikan hasil build frontend
if (fs.existsSync(config.distDir)) {
  app.use(express.static(config.distDir));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => res.sendFile(path.join(config.distDir, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

app.listen(config.port, () => console.log(`API berjalan di http://localhost:${config.port}`));
