# Ringkasan Eksekutif & Informasi Aplikasi Task Today

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Rilis v2.0  
> - **Penulis / Tim:** Tim Pengembang Portal Akademik Task Today  

---

## 1. Identitas & Tujuan Aplikasi

**Task Today** adalah portal perkuliahan digital dan ruang arsip akademik terpadu yang dirancang untuk mendukung ekosistem perkuliahan pada Program Studi **S1 Teknik Informatika / Sistem Informasi, Universitas Muhammadiyah Cirebon**.

### Tujuan Utama Portal:
1. **Pusat Modul Perkuliahan**: Menyajikan materi kuliah per pertemuan secara berurutan, lengkap dengan deskripsi terstruktur, penampil slide PPT/PPTX interaktif, tautan video pembelajaran YouTube, dan pembaca modul PDF langsung di browser.
2. **Arsip & Pengumpulan Tugas Mahasiswa**: Memfasilitasi mahasiswa dalam mengumpulkan hasil analisis proyek, dokumen spesifikasi kebutuhan perangkat lunak (SRS), serta tugas mandiri maupun kelompok dari seluruh mata kuliah yang ditempuh.
3. **Publikasi Jurnal Ilmiah Terbuka**: Menyediakan media publikasi karya ilmiah dan riset terapan bagi mahasiswa dan dosen dengan proses penelaahan (*peer-review/moderation*) sebelum diterbitkan ke publik.
4. **Wawasan & Analisis Teknologi**: Wadah publikasi artikel blog seputar Rekayasa Perangkat Lunak, Analisis & Desain Sistem, Interaksi Manusia dan Komputer (IMK), serta tren teknologi informasi.
5. **Transparansi & Manajemen Pendiri**: Mengenalkan profil para pendiri institusi/portal untuk membangun kredibilitas dan kejelasan kepengurusan.

---

## 2. Arsitektur Sistem Baru (Full-Stack Decoupled)

Pada versi 2.0, aplikasi telah beralih dari model *Frontend-Heavy Supabase Direct Client* menjadi **arsitektur full-stack mandiri dengan backend API khusus**:

```
+---------------------------------------------------------------------------------+
|                                 PENGGUNA (CLIENT)                               |
|       Browser Modern: Chrome / Firefox / Safari / Edge (Desktop, Tablet, HP)    |
+---------------------------------------------------------------------------------+
                                      |
                           (Protokol HTTPS / JSON)
                                      v
+---------------------------------------------------------------------------------+
|                       FRONTEND: SINGLE PAGE APPLICATION                         |
|   - Framework: React 19 + Vite 8 + React Router 7 + Bootstrap 5                 |
|   - Custom Styling: theme-nature.css (Ilustrasi Kampus Cerah & Teduh)           |
|   - Mesin PDF: pdfjs-dist (Ekstraksi teks cerdas & generate cover halaman 1)    |
|   - State Keamanan: JWT Access Token disimpan di JavaScript Memory              |
+---------------------------------------------------------------------------------+
                                      |
                     (RESTful API + HttpOnly Cookie Refresh)
                                      v
+---------------------------------------------------------------------------------+
|                          BACKEND SERVER (EXPRESS.JS)                            |
|   - Runtime: Node.js (>= 22.5) dengan Native SQLite (DatabaseSync)              |
|   - Security: Helmet, Express-Rate-Limit, CORS, Zod Validation, Bcrypt (12 rot) |
|   - Autentikasi: JWT Access Token (15 menit) + Rotating Refresh Token (7 hari)  |
|   - File Engine: Multer (Penyimpanan berkas lokal terisolasi di folder uploads/) |
|   - Mailer: Nodemailer SMTP Bridge (Penerusan pesan ke info@lokalkreatif.com)   |
+---------------------------------------------------------------------------------+
          |                                                       |
          v                                                       v
+-------------------------------------+         +---------------------------------+
|   BASIS DATA: SQLITE (node:sqlite)  |         |   STORAGE: FOLDER /uploads/     |
|   File: server/data/app.db          |         |   Dokumen PDF, PPT, Banner,     |
|   Mode: WAL (Write-Ahead Logging)   |         |   Foto Profil, & Cover Berkas   |
+-------------------------------------+         +---------------------------------+
```

---

## 3. Komponen Teknologi yang Digunakan

### A. Frontend Stack
- **React 19 & React DOM 19**: Pustaka antarmuka pengguna performa tinggi dengan fitur React Server Hooks dan modul komponen modern.
- **Vite 8**: Build tool generasi terbaru dengan Hot Module Replacement (HMR) berkecepatan milidetik dan bundler Rollup teroptimasi.
- **React Router 7**: Manajemen rute SPA dengan dukungan dynamic params, nested routes, dan route protection (`RequireAuth`).
- **Bootstrap 5.3 & Custom CSS**: Sistem grid responsif yang dipadukan dengan variabel tema khusus kampus (`--navy`, `--cream`, `--ember`, `--sky-soft`).
- **PDF.js (`pdfjs-dist`)**: Rendering canvas dokumen naskah secara lokal untuk peninjauan cepat cover dokumen.

### B. Backend Stack
- **Node.js (>= v22.5)**: Runtime JavaScript dengan modul bawaan `node:sqlite` (`DatabaseSync`), menghadirkan performa SQL sekelas C++ tanpa membutuhkan dependensi kompilasi node-gyp eksternal.
- **Express.js**: Kerangka kerja HTTP micro-services yang ringkas, stabil, dan modular.
- **JSON Web Token (`jsonwebtoken`)**: Implementasi penandatanganan dan verifikasi token berbasis kriptografi HMAC-SHA256.
- **Bcrypt.js**: Algoritma hashing kata sandi dengan salt cost 12 yang tahan terhadap serangan brute-force dan rainbow table.
- **Zod**: Validasi skema input data waktu-nyata pada seluruh endpoint API (mencegah SQL Injection & Payload Injection).
- **Helmet**: Pengamanan HTTP Headers standar OWASP (mencegah Clickjacking, MIME-sniffing, dan XSS).
- **Multer**: Manajemen berkas multipart/form-data dengan validasi ekstensi berkas yang ketat.
- **Nodemailer**: Layanan pengiriman email transaksi melalui protokol SMTP standar.

---

## 4. Keunggulan Sistem Versi Baru
1. **Tidak Ada Ketergantungan Layanan Cloud Berbayar**: Menggunakan SQLite lokal tertanam, menghemat biaya operasional bulanan tanpa membutuhkan langganan database eksternal.
2. **Kedaulatan & Keamanan Data Penuh**: File tugas mahasiswa, materi dosen, artikel, dan naskah jurnal disimpan di server sendiri, tidak terekspos di bucket pihak ketiga yang rentan salah konfigurasi ACL.
3. **Otorisasi Ketat (Role-Based Access Control)**: Memisahkan secara presisi wewenang antara Mahasiswa, Dosen, dan Administrator.
4. **Desain Human-Crafted**: Mempertahankan estetika orisinal bertema kampus ilustratif cerah, bersih dari pola "AI template" yang membosankan dan berulang.
