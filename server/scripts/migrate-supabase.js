/**
 * Memindahkan data lama dari Supabase ke database backend baru.
 *
 * Pemakaian:
 *   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=... npm run migrate:supabase
 *
 * - Tabel: assignments, materials, blogs, deletion_logs
 * - Berkas di Supabase Storage diunduh ke folder uploads/ dan URL-nya ditulis ulang.
 * - Aman dijalankan ulang: baris dengan id yang sama dilewati.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../src/config.js';
import { db } from '../src/db.js';

const base = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const key = process.env.SUPABASE_ANON_KEY || '';
if (!base || !key) {
  console.error('Isi SUPABASE_URL dan SUPABASE_ANON_KEY terlebih dahulu.');
  process.exit(1);
}
fs.mkdirSync(config.uploadDir, { recursive: true });

async function fetchTable(name) {
  const res = await fetch(`${base}/rest/v1/${name}?select=*`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) { console.warn(`- ${name}: dilewati (${res.status})`); return []; }
  return res.json();
}

const cache = new Map();
async function localize(url) {
  if (!url || !url.startsWith(base)) return url || '';
  if (cache.has(url)) return cache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const ext = path.extname(new URL(url).pathname) || '';
    const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    fs.writeFileSync(path.join(config.uploadDir, name), Buffer.from(await res.arrayBuffer()));
    cache.set(url, `/uploads/${name}`);
  } catch (e) {
    console.warn(`  gagal unduh ${url}: ${e.message}`);
    cache.set(url, url);
  }
  return cache.get(url);
}

function splitMeta(desc = '') {
  const m = desc.match(/<!--META:(.*?)-->/);
  let meta = {};
  if (m) { try { meta = JSON.parse(m[1]); } catch { /* abaikan */ } }
  return { meta, clean: desc.replace(/<!--META:.*?-->\s*/, '').trim() };
}

const exists = (t, id) => !!db.prepare(`SELECT 1 FROM ${t} WHERE id = ?`).get(id);
const bool = (v) => (v ? 1 : 0);

let n = { assignments: 0, materials: 0, blogs: 0, logs: 0 };

for (const a of await fetchTable('assignments')) {
  if (exists('assignments', a.id)) continue;
  const { meta, clean } = splitMeta(a.description);
  db.prepare(`INSERT INTO assignments (id,title,student_name,description,file_type,file_url,cover_url,mata_kuliah,dosen_pengampu,prodi,universitas,is_featured,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    a.id, a.title, a.student_name || '', clean, a.file_type || 'pdf', await localize(a.file_url), await localize(a.cover_url),
    meta.course || null, meta.lecturer || null, meta.prodi || null, meta.university || null, bool(a.is_featured), a.created_at || new Date().toISOString());
  n.assignments++;
}

for (const m of await fetchTable('materials')) {
  if (exists('materials', m.id)) continue;
  const { meta, clean } = splitMeta(m.description);
  db.prepare(`INSERT INTO materials (id,meeting_number,title,description,file_type,file_url,cover_url,mata_kuliah,dosen_pengampu,prodi,universitas,is_featured,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    m.id, m.meeting_number || 1, m.title, clean, m.file_type || 'pdf', await localize(m.file_url), await localize(meta.coverUrl || m.cover_url),
    meta.course || null, meta.lecturer || null, meta.prodi || null, meta.university || null, bool(m.is_featured), m.created_at || new Date().toISOString());
  n.materials++;
}

for (const b of await fetchTable('blogs')) {
  if (exists('blogs', b.id)) continue;
  db.prepare(`INSERT INTO blogs (id,title,slug,category,author,date,read_time,cover_url,summary,content,is_featured,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    String(b.id), b.title, b.slug || null, b.category || '', b.author || '', b.date || null, b.read_time || '',
    b.cover_url || '', b.summary || '', b.content || '', bool(b.is_featured), b.created_at || new Date().toISOString());
  n.blogs++;
}

for (const l of await fetchTable('deletion_logs')) {
  if (exists('deletion_logs', l.id)) continue;
  db.prepare('INSERT INTO deletion_logs (id,item_type,item_title,deleted_by,reason,deleted_at) VALUES (?,?,?,?,?,?)')
    .run(String(l.id), l.item_type, l.item_title, l.deleted_by, l.reason, l.deleted_at || new Date().toISOString());
  n.logs++;
}

console.log('Selesai:', n);
