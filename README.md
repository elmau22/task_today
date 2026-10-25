# Task Today - Portal Perkuliahan & Pengumpulan Tugas

Portal digital perkuliahan untuk menyimak materi modul, membaca teks ekstraksi dokumen secara interaktif, mengumpulkan serta mengarsipkan tugas mahasiswa, dan membaca artikel blog seputar sistem informasi dan teknologi.

## Fitur Utama

- **Katalog Tugas & Modul Materi**: Pengorganisasian tugas dan silabus materi perkuliahan per pertemuan untuk semua mata kuliah yang ditempuh.
- **Ekstraksi Dokumen PDF Otomatis**: Pratinjau cover otomatis dari halaman pertama PDF serta ekstraksi teks modul secara instan via PDF.js.
- **Penampil Dokumen Interaktif (*Ala Dicoding*)**: Halaman khusus pembacaan dokumen lengkap dengan progress checklist selesai/belum, penampil berkas hybrid (PDF/PPT/YouTube), dan ekspor cetak PDF rapi.
- **Portal Artikel Blog**: Catatan analisis dan artikel teknologi dengan rute halaman mandiri (`/blog/:id`).
- **Dashboard Manajemen (*Login*)**: Formulir pengelolaan arsip tugas, modul materi, artikel blog, dan audit log riwayat penghapusan berkas.

## Teknologi yang Digunakan

- **Frontend**: React 19, Vite, React Router 7, Bootstrap 5
- **Gaya & Tema**: Tema kustom bernuansa alam kampus (*nature/campus theme*)
- **Pemrosesan PDF**: `pdfjs-dist` (ekstraksi teks dan rendering halaman pertama menjadi cover berkas)
- **Backend & Database**: Supabase (PostgreSQL Database & Storage Buckets)

## Cara Menjalankan Proyek

1. **Instalasi dependensi:**
   ```bash
   npm install
   ```

2. **Pengaturan Lingkungan (.env):**
   Buat berkas `.env` dan isi kredensial Supabase:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Menjalankan Server Pengembangan Lokal:**
   ```bash
   npm run dev
   ```

4. **Build untuk Produksi:**
   ```bash
   npm run build
   ```
