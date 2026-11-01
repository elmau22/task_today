# Dokumentasi Resmi Sistem Portal Task Today

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Versi Dokumentasi:** v2.0.0-Production  
> - **Aplikasi:** Task Today (Portal Perkuliahan, Arsip Tugas, Modul Materi & Publikasi Jurnal)  
> - **Institusi:** Program Studi S1 Teknik Informatika / Sistem Informasi — Universitas Muhammadiyah Cirebon  

---

## 📌 Pengantar

Dokumen ini merupakan panduan komprehensif mengenai arsitektur, fitur pengembangan baru, serta perbaikan sistem keamanan dan visual yang telah diimplementasikan pada **Portal Perkuliahan Task Today**.

Dokumentasi disusun secara terstruktur dalam 3 folder utama yang mencakup seluruh aspek operasional, teknis, dan desain:

```
dokumentasi/
├── README.md                                    # Indeks & Panduan Navigasi Dokumentasi (Berkas Ini)
│
├── 01-informasi-aplikasi/                       # Folder 1: Seluk-Beluk & Operasional Aplikasi
│   ├── ringkasan-aplikasi.md                    # Deskripsi produk, profil institusi, arsitektur, dan tech stack
│   ├── panduan-instalasi-dan-lingkungan.md      # Panduan setup dev, file .env, build production, & deployment
│   └── panduan-peran-dan-hak-akses.md           # Sistem multi-role RBAC: Mahasiswa, Dosen, & Administrator
│
├── 02-pengembangan-sistem/                      # Folder 2: Fitur Baru yang Telah Dibangun
│   ├── pengembangan-backend.md                  # Pembangunan server mandiri Node.js + Express + SQLite
│   ├── pengembangan-halaman-pendiri.md          # Halaman Founder (/pendiri) dan panel administrasi dinamis
│   ├── pengembangan-publikasi-jurnal.md         # Modul jurnal ilmiah, workflow submission, review & penerbitan
│   ├── pengembangan-tugas-dan-materi.md         # Multi-mata kuliah, hybrid viewer (PDF/PPT/Video), & checklist
│   └── restrukturisasi-halaman-utama.md         # Tata urutan baru Home Page (Cover, About, Materi, Tugas, Jurnal, Blog, Kontak)
│
└── 03-perbaikan-dan-keamanan/                   # Folder 3: Audit, Penguatan Keamanan, & UI/UX
    ├── penguatan-keamanan-dan-jwt.md            # Keamanan data, migrasi ke JWT (Access & Refresh), Bcrypt, Rate Limit
    ├── perbaikan-arsitektur-dan-decoupling.md   # Pelepasan ketergantungan Supabase Client & modularisasi API
    └── penyempurnaan-desain-ui-ux.md            # Human-crafted visual, penghapusan "AI look", tema alam kampus
```

---

## 🧭 Ringkasan 8 Butir Pengembangan yang Telah Diselesaikan

| No | Butir Kebutuhan | Status | Rincian Dokumen Terkait |
|:---:|:---|:---:|:---|
| **1** | **Membuat Backend Mandiri** | Selesai | [02-pengembangan-sistem/pengembangan-backend.md](02-pengembangan-sistem/pengembangan-backend.md) |
| **2** | **Membuat Halaman Pendiri** | Selesai | [02-pengembangan-sistem/pengembangan-halaman-pendiri.md](02-pengembangan-sistem/pengembangan-halaman-pendiri.md) |
| **3** | **Membangun User & Role (Admin, Dosen, Mahasiswa)** | Selesai | [01-informasi-aplikasi/panduan-peran-dan-hak-akses.md](01-informasi-aplikasi/panduan-peran-dan-hak-akses.md) |
| **4** | **Membuat Halaman Publikasi Jurnal** | Selesai | [02-pengembangan-sistem/pengembangan-publikasi-jurnal.md](02-pengembangan-sistem/pengembangan-publikasi-jurnal.md) |
| **5** | **Memperkuat Keamanan Data dengan JWT** | Selesai | [03-perbaikan-dan-keamanan/penguatan-keamanan-dan-jwt.md](03-perbaikan-dan-keamanan/penguatan-keamanan-dan-jwt.md) |
| **6** | **Mengembangkan Halaman Tugas, Materi, & Jurnal** | Selesai | [02-pengembangan-sistem/pengembangan-tugas-dan-materi.md](02-pengembangan-sistem/pengembangan-tugas-dan-materi.md) |
| **7** | **Restrukturisasi Urutan Home Page & Kontak info@lokalkreatif.com** | Selesai | [02-pengembangan-sistem/restrukturisasi-halaman-utama.md](02-pengembangan-sistem/restrukturisasi-halaman-utama.md) |
| **8** | **Desain UI/UX Otentik (Menghilangkan Kesan AI Template)** | Selesai | [03-perbaikan-dan-keamanan/penyempurnaan-desain-ui-ux.md](03-perbaikan-dan-keamanan/penyempurnaan-desain-ui-ux.md) |

---

## 🚀 Panduan Cepat Menjalankan Sistem

1. **Jalankan Backend (Server API & SQLite):**
   ```bash
   cd task_today/server
   cp .env.example .env     # Atur JWT_ACCESS_SECRET, ADMIN_PASSWORD, dan SMTP
   npm install
   npm run dev              # Berjalan di http://localhost:4000
   ```

2. **Jalankan Frontend (React + Vite):**
   ```bash
   cd task_today
   npm install
   npm run dev              # Berjalan di http://localhost:5173
   ```

3. **Akses Web:**  
   Buka browser pada `http://localhost:5173`.
   - Login administrator bawaan: `admin@lokalkreatif.com` (password sesuai `ADMIN_PASSWORD` di `.env`).
   - Mahasiswa dapat langsung mendaftar secara mandiri melalui menu **Login -> Daftar sebagai mahasiswa**.

---
*Dokumentasi ini dikelola secara berkala untuk mendukung pengembangan dan pemeliharaan jangka panjang.*
