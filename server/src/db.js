import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
export const db = new DatabaseSync(config.dbPath);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

export const uid = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  identity_number TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','dosen','mahasiswa')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  student_name TEXT,
  description TEXT DEFAULT '',
  file_type TEXT DEFAULT 'pdf',
  file_url TEXT DEFAULT '#',
  cover_url TEXT DEFAULT '',
  mata_kuliah TEXT, dosen_pengampu TEXT, prodi TEXT, universitas TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  meeting_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_type TEXT DEFAULT 'pdf',
  file_url TEXT DEFAULT '#',
  cover_url TEXT DEFAULT '',
  mata_kuliah TEXT, dosen_pengampu TEXT, prodi TEXT, universitas TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT,
  category TEXT,
  author TEXT,
  date TEXT,
  read_time TEXT,
  cover_url TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  content TEXT DEFAULT '',
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS journals (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  abstract TEXT DEFAULT '',
  keywords TEXT DEFAULT '',
  category TEXT DEFAULT '',
  year INTEGER,
  volume TEXT DEFAULT '',
  issue TEXT DEFAULT '',
  doi TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','rejected')),
  review_note TEXT DEFAULT '',
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS founders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  email TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  mail_status TEXT NOT NULL DEFAULT 'pending',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deletion_logs (
  id TEXT PRIMARY KEY,
  item_type TEXT, item_title TEXT, deleted_by TEXT, reason TEXT,
  deleted_at TEXT NOT NULL
);
`);

export function seedAdmin() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users WHERE role = ?').get('admin').c;
  if (count > 0) return;
  let { adminEmail: email, adminPassword: password } = config;
  let generated = false;
  if (!email) email = 'admin@lokalkreatif.com';
  if (!password) {
    if (config.isProd) {
      throw new Error('ADMIN_PASSWORD wajib diisi untuk membuat akun admin pertama di production.');
    }
    password = crypto.randomBytes(9).toString('base64url');
    generated = true;
  }
  db.prepare(
    'INSERT INTO users (id,name,email,password_hash,role,created_at) VALUES (?,?,?,?,?,?)'
  ).run(uid(), config.adminName, email, bcrypt.hashSync(password, 12), 'admin', nowIso());
  console.log(`[seed] Admin dibuat: ${email}${generated ? `  password sementara: ${password}` : ''}`);
}

export async function seedBlogs() {
  if (db.prepare('SELECT COUNT(*) AS c FROM blogs').get().c > 0) return;
  const { INITIAL_BLOGS } = await import('./seed-blogs.js');
  const st = db.prepare(`INSERT INTO blogs (id,title,slug,category,author,date,read_time,cover_url,summary,content,is_featured,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (const b of INITIAL_BLOGS) {
    st.run(b.id, b.title, b.slug, b.category, b.author, b.date, b.read_time, b.cover_url, b.summary, b.content,
      b.is_featured ? 1 : 0, b.created_at || `${b.date}T00:00:00.000Z`);
  }
}
