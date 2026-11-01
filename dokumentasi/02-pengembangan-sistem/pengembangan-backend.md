# Laporan Pengembangan Backend Mandiri (Node.js & SQLite)

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Laporan Hasil Rancang Bangun Perangkat Lunak  
> - **Lokasi Kode Sumber:** `task_today/server/`  

---

## 1. Latar Belakang & Motivasi

Sebelumnya, aplikasi Task Today sepenuhnya mengandalkan akses langsung dari browser ke Supabase menggunakan anon-key. Pendekatan ini memiliki sejumlah kelemahan kritis:
1. **Keamanan Rendah**: Kunci API terekspos di bundle JavaScript publik, memungkinkan siapa saja yang memiliki alat pengembang (DevTools) untuk melakukan kueri langsung ke database.
2. **Ketergantungan Eksternal**: Ketergantungan pada server pihak ketiga menyebabkan aplikasi rentan terhadap batas kuota (*rate limiting*) dan biaya tak terduga.
3. **Logika Bisnis Tercecer**: Validasi izin, pemformatan data, dan otorisasi tersebar di berbagai komponen React alih-alih berada di lapisan server yang terpusat.

Untuk mengatasi persoalan tersebut, dibangun **Server Backend Mandiri** berbasis Node.js dan SQLite tertanam (*embedded*).

---

## 2. Struktur Modul Backend (`server/`)

```
task_today/server/
├── data/                      # Folder penyimpanan berkas basis data SQLite (app.db)
├── uploads/                   # Folder penyimpanan dokumen naskah (PDF, PPT, gambar)
├── scripts/
│   └── migrate-supabase.js    # Utilitas pemindahan data & berkas lama dari Supabase
├── src/
│   ├── config.js              # Manajemen konfigurasi terpusat & parsing .env
│   ├── db.js                  # Inisialisasi DatabaseSync SQLite, skema tabel, & seed data
│   ├── auth.js                # Helper JWT (access/refresh), verifikasi role, & cookies
│   ├── resource.js            # Generator RESTful CRUD generik yang aman
│   ├── mailer.js              # Integrasi pengiriman email SMTP via Nodemailer
│   ├── seed-blogs.js          # Dataset awal artikel blog analitikal
│   ├── index.js               # Entry point Express, middleware global, & static router
│   └── routes/
│       ├── auth.js            # Rute registrasi, login, refresh token, sesi me, ganti sandi
│       ├── users.js           # Rute manajemen pengguna (khusus administrator)
│       ├── content.js         # Rute tugas, materi, blog, dan pendiri
│       ├── journals.js        # Rute penerbitan naskah ilmiah & moderasi status
│       ├── contact.js         # Rute formulir kontak & penerusan email
│       ├── uploads.js         # Rute unggah berkas dengan Multer
│       └── logs.js            # Rute pencatatan riwayat audit penghapusan berkas
├── package.json
└── .env.example
```

---

## 3. Desain Skema Basis Data SQLite

Menggunakan pustaka resmi bawaan `node:sqlite` (`DatabaseSync`) dengan mode performa tinggi **Write-Ahead Logging (WAL)**:

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 1. Tabel Pengguna Sistem
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

-- 2. Tabel Refresh Token Berotasi
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0
);

-- 3. Tabel Tugas Perkuliahan
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

-- 4. Tabel Modul Materi Pertemuan
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

-- 5. Tabel Artikel Blog
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

-- 6. Tabel Publikasi Jurnal Ilmiah
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

-- 7. Tabel Profil Pendiri
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

-- 8. Tabel Pesan Masuk Formulir Kontak
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

-- 9. Tabel Audit Log Penghapusan Berkas
CREATE TABLE IF NOT EXISTS deletion_logs (
  id TEXT PRIMARY KEY,
  item_type TEXT, item_title TEXT, deleted_by TEXT, reason TEXT,
  deleted_at TEXT NOT NULL
);
```

---

## 4. Daftar Lengkap Endpoint REST API

| Kategori | Method | Endpoint | Akses / Role | Keterangan |
|:---|:---:|:---|:---:|:---|
| **Health** | `GET` | `/api/health` | Publik | Healthcheck status server |
| **Autentikasi** | `POST` | `/api/auth/register` | Publik (Rate-limited) | Pendaftaran akun mahasiswa mandiri |
| | `POST` | `/api/auth/login` | Publik (Rate-limited) | Masuk dan menerbitkan token JWT |
| | `POST` | `/api/auth/refresh` | Publik (HttpOnly Cookie) | Rotasi refresh token dan penerbitan access token |
| | `POST` | `/api/auth/logout` | Publik | Pembatalan refresh token & penghapusan cookie |
| | `GET` | `/api/auth/me` | Terotentikasi | Mendapatkan data profil pengguna yang sedang login |
| | `POST` | `/api/auth/password` | Terotentikasi | Ganti kata sandi mandiri |
| **Pengguna** | `GET` | `/api/users` | Admin | Menampilkan seluruh daftar pengguna |
| | `POST` | `/api/users` | Admin | Membuat akun dosen atau admin baru |
| | `PATCH` | `/api/users/:id` | Admin | Mengubah peran, status aktif, atau reset sandi |
| | `DELETE`| `/api/users/:id` | Admin | Menghapus akun pengguna (selain akun sendiri) |
| **Tugas** | `GET` | `/api/assignments` | Publik | Mengambil seluruh katalog tugas |
| | `GET` | `/api/assignments/:id` | Publik | Mengambil detail tugas berdasarkan ID |
| | `POST` | `/api/assignments` | Terotentikasi | Mengumpulkan tugas baru (owner otomatis diset) |
| | `PUT` | `/api/assignments/:id` | Pemilik / Dosen / Admin | Memperbarui berkas atau data tugas |
| | `DELETE`| `/api/assignments/:id` | Pemilik / Dosen / Admin | Menghapus tugas (tercatat di log audit) |
| **Materi** | `GET` | `/api/materials` | Publik | Mengambil katalog silabus materi pertemuan |
| | `GET` | `/api/materials/:id` | Publik | Mengambil detail materi pertemuan |
| | `POST` | `/api/materials` | Dosen / Admin | Menambah materi perkuliahan baru |
| | `PUT` | `/api/materials/:id` | Dosen / Admin | Memperbarui isi materi atau slide |
| | `DELETE`| `/api/materials/:id` | Dosen / Admin | Menghapus materi (tercatat di log audit) |
| **Jurnal** | `GET` | `/api/journals` | Publik (`published`) | Mengambil katalog jurnal yang sudah terbit |
| | `GET` | `/api/journals?scope=mine` | Terotentikasi | Mengambil naskah milik pengguna sendiri |
| | `GET` | `/api/journals?scope=review` | Dosen / Admin | Mengambil antrean naskah yang butuh review |
| | `POST` | `/api/journals` | Terotentikasi | Kirim naskah baru (Mhs: pending; Dosen: published) |
| | `PUT` | `/api/journals/:id` | Pemilik (sebelum terbit) / Staff | Memperbarui naskah jurnal |
| | `PATCH` | `/api/journals/:id/status` | Dosen / Admin | Mengubah status: `published`, `rejected`, `pending` |
| | `DELETE`| `/api/journals/:id` | Pemilik (sebelum terbit) / Staff | Menghapus naskah (tercatat di log audit) |
| **Pendiri** | `GET` | `/api/founders` | Publik | Mengambil data profil pendiri |
| | `POST` | `/api/founders` | Admin | Menambah profil pendiri baru |
| | `PUT` | `/api/founders/:id` | Admin | Mengubah data profil pendiri |
| | `DELETE`| `/api/founders/:id` | Admin | Menghapus data pendiri |
| **Kontak** | `POST` | `/api/contact` | Publik (Rate-limited) | Mengirim pesan & meneruskan ke info@lokalkreatif.com |
| | `GET` | `/api/contact` | Admin | Membaca daftar pesan masuk |
| | `PATCH` | `/api/contact/:id` | Admin | Menandai pesan telah dibaca / belum |
| | `DELETE`| `/api/contact/:id` | Admin | Menghapus riwayat pesan |
| **Uploads** | `POST` | `/api/uploads` | Terotentikasi | Mengunggah dokumen/gambar (maksimal 50MB) |
| **Logs** | `GET` | `/api/logs` | Dosen / Admin | Melihat catatan log berkas yang dihapus |
