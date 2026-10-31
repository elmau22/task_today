import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const isProd = process.env.NODE_ENV === 'production';

function secret(name) {
  const v = process.env[name];
  if (v && v.length >= 32) return v;
  if (isProd) {
    throw new Error(`${name} wajib diisi (minimal 32 karakter) saat NODE_ENV=production.`);
  }
  console.warn(`[config] ${name} belum diisi; memakai secret acak sementara (sesi hilang saat server restart).`);
  return crypto.randomBytes(48).toString('hex');
}

export const config = {
  isProd,
  port: Number(process.env.PORT || 4000),
  dbPath: process.env.DB_PATH || path.join(root, 'data', 'app.db'),
  uploadDir: process.env.UPLOAD_DIR || path.join(root, 'uploads'),
  distDir: path.resolve(root, '..', 'dist'),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  accessSecret: secret('JWT_ACCESS_SECRET'),
  refreshSecret: secret('JWT_REFRESH_SECRET'),
  accessTtl: process.env.JWT_ACCESS_TTL || '15m',
  refreshTtlDays: Number(process.env.JWT_REFRESH_DAYS || 7),
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminName: process.env.ADMIN_NAME || 'Administrator',
  mail: {
    to: process.env.CONTACT_TO || 'info@lokalkreatif.com',
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@lokalkreatif.com',
  },
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 50),
};
