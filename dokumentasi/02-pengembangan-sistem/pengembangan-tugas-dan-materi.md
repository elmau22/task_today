# Laporan Pengembangan Halaman Tugas, Materi, & Viewer Dokumen

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Pembaruan & Normalisasi Sistem Berkas  
> - **Rute Terkait:** `/tugas`, `/tugas/:id`, `/materi`, `/materi/:id`  

---

## 1. Latar Belakang & Masalah Sebelumnya

Pada versi terdahulu, portal menyimpan metadata multi-mata kuliah (seperti nama dosen pengampu, nama mata kuliah, program studi, dan perguruan tinggi) dengan cara menyematkan tag komentar buatan di dalam teks deskripsi:
```html
<!--META:{"course":"Analisis & Desain","lecturer":"Dian Ade Kurnia, M.Kom",...}-->
Deskripsi tugas ditulis di sini...
```
**Kelemahan Cara Lama:**
- Rentan rusak jika pengguna mengedit deskripsi tanpa sengaja menghapus tag komentar.
- Kueri pencarian SQL menjadi lambat karena harus melakukan regex parsing pada kolom teks panjang.
- Kesulitan saat ingin melakukan filter mata kuliah atau pengelompokan per dosen.

---

## 2. Solusi: Normalisasi Skema Database Bersih

Pada backend baru, seluruh metadata telah dipindahkan menjadi kolom skema database SQLite formal:
- `mata_kuliah TEXT`
- `dosen_pengampu TEXT`
- `prodi TEXT`
- `universitas TEXT`
- `cover_url TEXT`
- `meeting_number INTEGER` (khusus materi)
- `student_name TEXT` (khusus tugas)

Helper `metadataHelper.js` tetap dipertahankan dengan mekanisme *backward-compatibility*: jika mendeteksi data lama dengan tag `<!--META:-->`, sistem otomatis mengekstraknya secara mulus, namun untuk data baru tersimpan di kolom SQL permanen.

---

## 3. Fitur Halaman Katalog Tugas (`/tugas`) & Materi (`/materi`)

1. **Filter Berdasarkan Mata Kuliah**:
   - Menghasilkan daftar mata kuliah unik secara otomatis dari database:
     - *Analisis & Desain Perangkat Lunak*
     - *Interaksi Manusia dan Komputer*
     - *Pemrograman Berorientasi Objek*
     - *Pemrograman Web & Mobile*
     - *Basis Data*
     - dan mata kuliah lainnya.
2. **Pencarian Real-Time Cepat**:
   - Menelusuri judul dokumen, nama mahasiswa, nama dosen, maupun tipe format berkas.
3. **Cover Dokumen Cerdas (Smart PDF Cover)**:
   - Komponen `PdfCoverImage` memanfaatkan mesin PDF.js untuk me-render halaman pertama naskah PDF secara otomatis menjadi cover visual yang tajam.
   - Dilengkapi fallback angka pertemuan (misal: "P-01", "P-02") untuk materi perkuliahan.

---

## 4. Penampil Dokumen Interaktif Hybrid (`DocumentViewerPage`)

Halaman penampil dokumen diakses melalui `/materi/:id` dan `/tugas/:id`:

1. **Dukungan Format Berkas Hibrida**:
   - **PDF**: Menampilkan dokumen interaktif dengan opsi ekstraksi teks cerdas per halaman (*text reader ala Dicoding*) dan preview visual.
   - **PPT / PPTX (Slide Presentasi)**: Menampilkan slide presentasi perkuliahan secara langsung di dalam bingkai viewer responsif.
   - **Video YouTube**: Memutar rekaman video penjelasan dosen yang relevan dengan modul perkuliahan.
2. **Checklist Progres Belajar Mahasiswa**:
   - Mahasiswa dapat menandai materi "Sudah Selesai Dipelajari" atau "Belum Selesai". Status progres ini disimpan secara persisten di penyimpanan browser mahasiswa.
3. **Sidebar Navigasi Modul Perkuliahan**:
   - Daftar seluruh pertemuan (Pertemuan 1 hingga Selesai) tersusun rapi di sisi samping halaman, memudahkan mahasiswa berpindah modul tanpa harus kembali ke halaman beranda.
4. **Fitur Ekspor Cetak Rapi**:
   - Tombol cetak/print dengan stylesheet media cetak khusus (`@media print`) yang menghilangkan elemen navigasi dan iklan/tombol, menyisakan teks materi bersih untuk dicetak menjadi hardcopy.
