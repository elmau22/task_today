# Laporan Pengembangan Publikasi Jurnal Ilmiah

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Modul Baru Selesai Diimplementasikan  
> - **Rute Publik:** `/jurnal` dan `/jurnal/:id`  
> - **Komponen Utama:** `JournalPage.jsx`, `JournalDetailPage.jsx`, dan `JournalsTab.jsx`  

---

## 1. Latar Belakang & Urgensi

Sebagai bagian dari luaran perkuliahan dan riset terapan di bidang Rekayasa Perangkat Lunak dan Sistem Informasi, mahasiswa dan dosen memerlukan sarana untuk mengarsipkan dan mempublikasikan karya ilmiah mereka.

Sebelumnya, portal hanya berfokus pada arsip tugas perkuliahan per pertemuan. Dengan hadirnya **Modul Publikasi Jurnal Ilmiah**, portal Task Today bertransformasi menjadi platform open-access akademik yang kredibel.

---

## 2. Alur Kerja Penerbitan & Penelaahan (Review Workflow)

Sistem jurnal mengadopsi model penelaahan sejawat berjenjang (*moderated publication workflow*):

```
[ MAHASISWA ] ──> Unggah Naskah (PDF + Metadata) ──> Status: PENDING
                                                           |
                                                           v
                                            [ DOSEN / ADMINISTRATOR ]
                                             (Melakukan Penelaahan)
                                            /                      \
                                           v                        v
                            Status: PUBLISHED                       Status: REJECTED
                       (Tampil di Katalog Publik)             (Catatan Revisi Ditampilkan
                                                                    ke Penulis)
```

1. **Pengiriman oleh Mahasiswa**:
   - Mahasiswa login dan membuka tab **"Jurnal"** di Dashboard.
   - Mengisi judul, daftar penulis, abstrak, kata kunci, kategori bidang ilmu, tahun, volume, nomor terbitan, serta mengunggah berkas naskah PDF lengkap.
   - Naskah yang dikirim oleh mahasiswa **otomatis berstatus `pending`** (menunggu moderasi). Naskah ini **tidak akan tampil** di katalog publik hingga disetujui.

2. **Pengiriman oleh Dosen & Administrator**:
   - Naskah yang diunggah langsung oleh akun dosen atau admin otomatis memperoleh status `published` dan tanggal terbit tercatat waktu-nyata.

3. **Penelaahan & Keputusan oleh Dosen/Admin**:
   - Dosen dan Admin memiliki tab khusus moderasi di dashboard (`api/journals?scope=review`).
   - Tindakan yang dapat dilakukan:
     - **Terbitkan (`published`)**: Naskah lolos seleksi dan seketika muncul di halaman publik `/jurnal`.
     - **Tolak (`rejected`)**: Dosen/Admin diminta memasukkan catatan revisi (`review_note`), yang langsung dapat dibaca oleh mahasiswa pengunggah.
     - **Tarik Kembali (`pending`)**: Naskah yang sudah terbit dapat ditarik kembali jika ditemukan galat penulisan.

---

## 3. Fitur Halaman Katalog Jurnal Publik (`/jurnal`)

1. **Pencarian Cerdas (Full-text Search)**:
   - Mahasiswa atau pengunjung dapat mengetikkan kata kunci pada kolom pencarian. Sistem mencocokkan secara instan terhadap Judul Naskah, Nama Penulis, Kata Kunci (*keywords*), maupun Kategori Bidang Kajian.
2. **Filter Tahun Terbitan**:
   - Dropdown seleksi tahun terbitan yang secara dinamis mengekstrak seluruh tahun penerbitan yang tersedia pada database.
3. **Desain Daftar Naskah Editorial**:
   - Menampilkan sitasi bersih yang memuat Kategori, Tahun, Volume, Nomor Terbitan, Judul Naskah, Nama Lengkap Penulis, serta pratinjau abstrak ringkas (*clamped text*).

---

## 4. Fitur Halaman Detail Jurnal (`/jurnal/:id`)

1. **Informasi Metadata Lengkap**:
   - Judul lengkap, afiliasi penulis, kategori, dan identitas terbitan.
   - Tautan langsung pengenal objek digital (**DOI / Digital Object Identifier**) jika naskah terindeks di pengindeks eksternal.
2. **Penampil Berkas PDF Terintegrasi**:
   - Dilengkapi *responsive iframe viewer* yang memungkinkan pengunjung membaca seluruh isi dokumen naskah (pendahuluan, metodologi, hasil analisis, pembahasan, hingga daftar pustaka) langsung di browser tanpa perlu mengunduh terlebih dahulu.
3. **Tombol Unduh Berkas Resmi**:
   - Tersedia tombol *Unduh PDF* untuk keperluan sitasi atau pembacaan luring (*offline*).
