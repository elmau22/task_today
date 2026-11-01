# Laporan Pengembangan Halaman Pendiri (Founders Page)

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Fitur Baru Selesai Diimplementasikan  
> - **Rute Publik:** `/pendiri`  
> - **Komponen Utama:** `src/modules/founders/FounderPage.jsx` & `src/modules/admin/FoundersTab.jsx`  

---

## 1. Latar Belakang & Tujuan

Halaman Pendiri dihadirkan untuk menampilkan profil tokoh-tokoh inisiator, pendiri, dan pembina di balik portal Task Today serta ekosistem perkuliahan teknologi informasi terkait.

Tujuan implementasi:
1. Memberikan identitas dan transparansi kelembagaan yang jelas kepada mahasiswa, civitas akademika, dan pengunjung umum.
2. Menyediakan sarana komunikasi profesional melalui tautan profil LinkedIn dan kontak email resmi.
3. Memberikan fleksibilitas penuh kepada Administrator untuk memperbarui, menambah, atau menyusun urutan tampilan profil secara dinamis tanpa perlu mengubah baris kode.

---

## 2. Struktur Data Profil Pendiri

Setiap data pendiri disimpan dalam tabel `founders` dengan struktur kolom:

| Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | `TEXT PRIMARY KEY` | UUID unik identitas pendiri |
| `name` | `TEXT NOT NULL` | Nama lengkap dan gelar akademis pendiri |
| `position` | `TEXT` | Jabatan struktural / peran (misal: *Inisiator Portal & Dosen Pembina*) |
| `bio` | `TEXT` | Biografi singkat, latar belakang pendidikan, dan fokus keahlian |
| `photo_url` | `TEXT` | Tautan berkas foto profil resmi (diunggah ke server lokal) |
| `email` | `TEXT` | Alamat surel resmi untuk korespondensi |
| `linkedin_url` | `TEXT` | Tautan profil profesional LinkedIn |
| `sort_order` | `INTEGER` | Angka urutan tampilan di halaman depan (angka lebih kecil tampil lebih dulu) |
| `created_at` | `TEXT` | Waktu pencatatan data dalam format ISO |

---

## 3. Implementasi Antarmuka Pengguna

### A. Tampilan Publik (`/pendiri`)
- **Aksesibilitas**: Dapat dibuka oleh siapa saja tanpa perlu masuk akun.
- **Tata Letak**:
  - Menggunakan layout editorial dua kolom bergantian (*alternating visual layout*) yang elegan dan mudah dibaca.
  - Foto pendiri ditampilkan dengan rasio aspek standar portrait (4:5) dengan border tegas dan bayangan khas tema kampus.
  - Jika belum ada foto yang diunggah, sistem otomatis menampilkan inisial huruf nama pendiri pada placeholder berdesain rapi (*avatar fallback*).
  - Tautan kontak email dan LinkedIn disematkan dengan atribut keamanan `rel="noreferrer noopener"`.

### B. Panel Pengelolaan Admin (Dashboard -> Tab "Pendiri")
- **Wewenang**: Khusus akun dengan peran `admin`.
- **Fitur Formulir**:
  - Tambah pendiri baru: Form pengisian nama, posisi, biografi, email, LinkedIn, urutan, serta pengunggah berkas foto (`<input type="file" accept="image/*">`).
  - Edit data pendiri: Mengubah teks atau memperbarui foto lama.
  - Hapus data pendiri: Disertai konfirmasi keamanan untuk menghindari penghapusan tidak sengaja.
  - Sorting: Admin dapat mengubah angka `sort_order` kapan saja untuk mengatur siapa yang tampil pertama di halaman publik.

---

## 4. Kesiapan Integrasi Data

Sistem backend dan antarmuka telah siap 100%. Saat ini tabel masih bersih dan siap menerima data profil riil (nama, foto, dan bio) yang akan dikirimkan oleh pengguna kapan saja, baik melalui panel admin web langsung maupun diinisialisasi melalui migrasi database.
