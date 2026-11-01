# Task Today - Portal Perkuliahan & Publikasi Jurnal

Portal digital perkuliahan untuk menyimak materi perkuliahan per pertemuan, membaca naskah modul secara interaktif, mengumpulkan serta mengarsipkan tugas mahasiswa, mempublikasikan karya jurnal ilmiah, dan membaca catatan blog analisis sistem informasi.

## 🌟 Fitur Utama (v2.0)

1. **Katalog Tugas & Modul Materi**: Pengorganisasian tugas dan silabus materi perkuliahan per pertemuan untuk semua mata kuliah yang ditempuh (Multi-course).
2. **Halaman Pendiri (/pendiri)**: Menampilkan profil para inisiator dan pendiri institusi dengan tata letak editorial yang rapi.
3. **Multi-Role User (Admin, Dosen, Mahasiswa)**: Sistem peran terpisah dengan hak akses presisi. Mahasiswa dapat mendaftar mandiri.
4. **Publikasi Jurnal Ilmiah (/jurnal)**: Publikasi naskah ilmiah dengan alur moderasi penelaahan oleh Dosen/Admin sebelum terbit ke publik.
5. **Keamanan Data Berbasis JWT**: Otentikasi kriptografis standar industri dengan perlindungan sesi dan token aman.
6. **Penampil Dokumen Interaktif Hybrid**: Pembaca naskah PDF dengan ekstraksi teks, penampil slide PPT/PPTX, pemutar video YouTube, dan progress checklist belajar.
7. **Restrukturisasi Beranda & Kontak info@lokalkreatif.com**: Urutan halaman muka terstruktur (Cover & Tujuan -> About -> Materi -> Tugas -> Jurnal -> Blog -> Kontak Person).
8. **Desain UI/UX Human-Crafted**: Estetika tema kampus komik cerah dan hangat, bebas dari kesan artifisial ("AI template look").

---

## 🚀 Cara Menjalankan Secara Lokal (Development)

1. **Instalasi dependensi:**
   ```bash
   npm install
   ```

2. **Pengaturan Lingkungan (.env):**
   Buat file `.env` di root folder (bisa menyalin dari `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://vydtiijkcnpholfzukas.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   Aplikasi akan aktif di `http://localhost:5173`.

---

## ⚡ Panduan Deploy Cepat ke Vercel & Supabase (Hanya 3 Menit)

Aplikasi ini 100% mendukung arsitektur Serverless modern tanpa perlu menyewa VPS atau mengelola server Linux!

### Langkah 1: Siapkan Tabel di Supabase (1 Kali Klik)
1. Buka dashboard [supabase.com](https://supabase.com) dan masuk ke project Anda.
2. Di bilah menu kiri, buka **SQL Editor**.
3. Buka file `supabase_schema.sql` yang ada di proyek ini, salin seluruh kodenya, tempel ke SQL Editor Supabase, lalu klik **Run**.
4. Di menu **Storage**, pastikan bucket `covers` dan `attachments` berstatus **Public Bucket**.

### Langkah 2: Deploy ke Vercel
1. Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub Anda.
2. Klik tombol **"Add New..." -> "Project"**.
3. Impor (*Import*) repositori GitHub proyek **task_today**.
4. Pada bagian **Environment Variables**, tambahkan 2 variabel:
   - `VITE_SUPABASE_URL` = (URL project Supabase Anda)
   - `VITE_SUPABASE_ANON_KEY` = (Anon Key Supabase Anda)
5. Klik **Deploy**!
   Dalam waktu kurang dari 1 menit, website Anda sudah aktif secara global dengan domain gratis `https://nama-project.vercel.app` dan sertifikat SSL HTTPS otomatis.
