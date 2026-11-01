# Panduan Instalasi, Konfigurasi Lingkungan, & Deployment (Vercel & Supabase)

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 02 November 2026  
> - **Waktu / Jam:** 00:05:00 WIB (GMT+7)  
> - **Status Dokumen:** Panduan Deployment Serverless Resmi  
> - **Platform:** Vercel (Frontend & CDN) + Supabase (PostgreSQL Database, Auth JWT, & Storage)  

---

## 1. Mengapa Vercel & Supabase?

Kombinasi **Vercel** dan **Supabase** merupakan standar industri modern (*Modern Jamstack & Serverless*) yang sangat direkomendasikan karena:
1. **Bebas Perawatan Server (Zero Maintenance)**: Tidak perlu mengelola terminal Linux, SSH, Nginx, PM2, maupun pembaruan sistem operasi.
2. **Biaya Rp 0 (100% Free Tier Selamanya)**: Baik Vercel maupun Supabase menyediakan paket gratis yang sangat leluasa untuk skala portal perkuliahan.
3. **Keamanan Otomatis**: Sertifikat SSL HTTPS otomatis terpasang dan diperpanjang sendiri oleh Vercel.
4. **Kecepatan Global (Edge Network)**: Aset web disajikan dari server CDN terdekat dengan pengunjung.

---

## 2. Langkah Demi Langkah Deploy ke Vercel & Supabase (Hanya 3 Menit)

### Tahap 1: Eksekusi Skema Database di Supabase
1. Masuk ke dashboard proyek Supabase Anda: **[supabase.com/dashboard](https://supabase.com/dashboard)**.
2. Pada bilah navigasi kiri, klik ikon **SQL Editor** (`>_`).
3. Buka file **`supabase_schema.sql`** yang tersedia di repositori ini, salin seluruh kodenya, tempel ke dalam SQL Editor Supabase, lalu klik tombol **Run**.
   *Perintah ini akan secara otomatis membuat tabel: `profiles`, `assignments`, `materials`, `blogs`, `journals`, `founders`, `contact_messages`, dan `deletion_logs`, lengkap dengan kebijakan Row Level Security (RLS).*
4. Masuk ke menu **Storage** di bilah kiri Supabase:
   * Buat bucket baru bernama **`covers`** (Centang *Public bucket*).
   * Buat bucket baru bernama **`attachments`** (Centang *Public bucket*).

---

### Tahap 2: Menghubungkan Repositori ke Vercel
1. Buka **[vercel.com](https://vercel.com)** dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** di kanan atas -> pilih **"Project"**.
3. Cari dan pilih repositori GitHub proyek **wish_task_today** (atau **task_today**), lalu klik **Import**.
4. Di halaman konfigurasi proyek Vercel:
   * **Framework Preset**: Biarkan otomatis mendeteksi **Vite**.
   * **Root Directory**: Jika proyek berada dalam subfolder `task_today`, klik *Edit* pada Root Directory dan arahkan ke `task_today`.
5. Buka bagian **Environment Variables** (Variabel Lingkungan), lalu masukkan dua data kredensial Supabase Anda:
   * **NAME**: `VITE_SUPABASE_URL`  
     **VALUE**: `https://xxxxxxxxxxxx.supabase.co`
   * **NAME**: `VITE_SUPABASE_ANON_KEY`  
     **VALUE**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
6. Klik tombol **Deploy**!

---

### Tahap 3: Selesai!
Dalam waktu kurang dari 60 detik:
- Vercel akan mengompilasi aplikasi dan memberikan domain resmi ber-SSL gratis, misalnya:
  `https://tasktoday-portal.vercel.app`
- Setiap kali Anda melakukan perubahan kode dan menekan `git push` ke GitHub, Vercel akan **otomatis melakukan pembaruan (auto-deploy)** tanpa henti.
