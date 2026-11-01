# Restrukturisasi Urutan Halaman Utama (Home Page) & Integrasi Email Kontak

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Pembaruan Tata Letak & Alur Komunikasi  
> - **Komponen Terkait:** `src/modules/home/HomePage.jsx` & `src/components/ContactForm.jsx`  

---

## 1. Latar Belakang & Kebutuhan

Sesuai butir instruksi ke-7, susunan halaman depan (Home Page) telah ditata ulang secara presisi agar alur informasi mengalir runut dari perkenalan hingga aksi komunikasi:

```
+---------------------------------------------------------------------------------+
| 1. COVER WEBSITE & PENJELASAN SINGKAT TUJUAN (Hero Section)                     |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| 2. ABOUT (Filosofi & Nilai Belajar dengan Tenang)                               |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| 3. MATERI (Bahan Kuliah per Pertemuan 1 - Selesai)                              |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| 4. TUGAS (Katalog Arsip Tugas Mahasiswa)                                        |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| 5. JURNAL (Publikasi Naskah Ilmiah Dosen & Mahasiswa)                           |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| 6. BLOG (Catatan Analisis Sistem & Tren Teknologi)                              |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| 7. CONTACT PERSON (Formulir Hubungi Kami -> info@lokalkreatif.com)              |
+---------------------------------------------------------------------------------+
```

---

## 2. Rincian Setiap Bagian pada Halaman Utama

### 1. Cover Website & Penjelasan Singkat Tujuan (Hero Section)
- **Komponen Visual**: `CampusScene` (latar ilustrasi kampus cerah Universitas Muhammadiyah Cirebon yang hangat dan ramah).
- **Judul**: *Task Today*
- **Penjelasan Singkat Tujuan**:
  > *"Tempat dosen membagikan materi per pertemuan, mahasiswa mengumpulkan tugas, dan keduanya menerbitkan tulisan ilmiah, semuanya dalam satu portal yang rapi dan mudah dicari."*
- **Tombol Aksi**: Navigasi cepat (*Call to Action*) mengarah langsung ke bagian `#materi` serta tombol *Masuk / Daftar* ke sistem.

### 2. About (Tentang Portal)
- Menjelaskan latar belakang pendirian portal bagi mahasiswa Program Studi Teknik Informatika / Sistem Informasi.
- Menekankan kemudahan belajar berurutan per pertemuan, akses arsip dokumen lengkap, serta menyertakan tautan untuk mengenal tokoh di balik portal melalui rute `/pendiri`.

### 3. Materi Perkuliahan
- Menampilkan kartu modul materi terpilih (*featured*) atau materi pertemuan awal.
- Setiap kartu menampilkan badge nomor pertemuan (misal: "P1", "P2"), judul modul, nama dosen pengampu, dan tombol pintas ke katalog `/materi`.

### 4. Tugas Perkuliahan
- Menampilkan tugas-tugas mahasiswa terbaru atau unggulan dari berbagai mata kuliah.
- Memperlihatkan pratinjau cover dokumen, nama mata kuliah, mahasiswa pengumpul, dan dosen pengampu.

### 5. Jurnal Ilmiah
- Bagian publikasi karya ilmiah yang menampilkan 4 naskah terbaru yang telah berstatus terbit (*published*).
- Menampilkan sitasi bersih: kategori, tahun rilis, judul penelitian, dan nama penulis dengan tautan ke halaman rincian naskah.

### 6. Blog & Wawasan Teknologi
- Menampilkan 3 artikel wawasan analisis sistem terpopuler dengan gambar sampul, waktu baca (misal: "4 menit baca"), dan ringkasan isi artikel.

### 7. Contact Person (Formulir Terhubung ke info@lokalkreatif.com)
- Diletakkan di bagian paling bawah beranda sebagai pintu gerbang komunikasi civitas akademika atau pihak luar.
- Menggunakan komponen `ContactForm` yang terhubung langsung dengan backend API.

---

## 3. Mekanisme Pengiriman Email Kontak ke info@lokalkreatif.com

Alur kerja pengiriman pesan formulir kontak:

1. **Input Pengguna**: Pengunjung mengisi Nama, Alamat Email, Perihal/Subjek, dan Isi Pesan.
2. **Penyimpanan di Basis Data**: Pesan **selalu disimpan terlebih dahulu** ke dalam tabel `contact_messages` di database lokal dengan status `mail_status = 'pending'`.
3. **Penerusan via SMTP (Nodemailer)**:
   - Jika kredensial SMTP pada berkas `.env` (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) telah diisi, server Express akan langsung meneruskan pesan ke alamat tujuan **`info@lokalkreatif.com`** dengan format HTML dan teks rapi.
   - Kolom `replyTo` diset ke email pengunjung, sehingga administrator dapat langsung menekan tombol *Reply* di aplikasi email untuk membalas pesan.
   - Status pengiriman diperbarui menjadi `'sent'` atau `'failed'`.
4. **Fallback Tanpa SMTP**:
   - Jika konfigurasi SMTP belum diisi (misalnya saat pengujian di localhost), server tidak akan mengalami crash (*fail-safe*). Pesan tetap tersimpan dengan status `'skipped'` dan dapat dibaca oleh Administrator melalui **Dashboard -> Tab Pesan Masuk**.
5. **Keamanan Anti-Spam**:
   - Dilengkapi *rate limiter* (maksimal 5 pesan per jam per alamat IP).
   - Dilengkapi *honeypot hidden input* untuk mendeteksi dan menggagalkan bot spam otomatis secara hening.
