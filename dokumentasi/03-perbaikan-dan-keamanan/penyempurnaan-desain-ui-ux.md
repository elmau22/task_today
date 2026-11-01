# Penyempurnaan Desain UI & UX: Menghilangkan Kesan "AI-Generated"

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Evaluasi Estetika Desain & Panduan Gaya Antarmuka  
> - **Fokus Utama:** Butir Persyaratan No. 8 (Human-Crafted & Authentic UI/UX)  

---

## 1. Analisis: Apa yang Membuat Desain Terlihat "Buatan AI"?

Banyak antarmuka web modern yang dihasilkan oleh generator AI terjebak dalam pola visual seragam yang kaku dan terasa artifisial (*AI template tropes*):
1. **Gradien Ungu-Biru Futuristik Generik**: Pemakaian latar belakang gradien *cyberpunk / SaaS* neon ungu ke biru (`#6366f1` ke `#a855f7`) pada konteks yang sama sekali tidak relevan dengan perkuliahan kampus.
2. **Glassmorphism Berlebihan**: Kartu semi-transparan buram (*frosted glass*) dengan border putih tipis 1px dan bayangan kabur melayang yang membuat teks sulit dibaca dan memberatkan performa rendering GPU perangkat mobile.
3. **Penyebaran Chip/Badge Robotik**: Menempelkan badge kecil dengan ikon robot, kilatan bintang (*sparkles* ✨), atau jargon teknologi seperti "AI Powered", "Next-Gen", atau "Smart Hub" di hampir setiap baris judul.
4. **Animasi Berputar Tanpa Makna**: Animasi partikel melayang acak atau teks bergerak yang justru mengaburkan fokus mahasiswa yang sedang membaca silabus materi atau petunjuk pengerjaan tugas.

---

## 2. Solusi: Desain Humanis Bertema "Kampus Cerah & Teduh"

Untuk memastikan portal Task Today memiliki kepribadian visual yang otentik dan bersahabat, tim mempertahankan dan menyempurnakan tema visual khusus bernuansa **Kampus Cerah (Nature & Campus Comic Style)**:

```
+---------------------------------------------------------------------------------+
| PALET WARNA ALAM KAMPUS (HUMANIS, HANGAT, & TEGAS)                              |
|                                                                                 |
|  [ #14283f ]   Navy Pekat (Teks utama, outline tegas, bayangan komik 5px)      |
|  [ #fbf5e3 ]   Krem Lembut (Latar belakang nyaman untuk mata, tidak silau)     |
|  [ #d6372f ]   Ember Red (Aksen penegas, tombol utama, identitas merah kampus)  |
|  [ #2f66b3 ]   Biru Kampus (Tautan, header pendukung, nuansa akademik)         |
|  [ #8cc7e8 ]   Langit Cerah (Latar banner, aksen lembut)                        |
|  [ #f6c445 ]   Kuning Surya (Sorotan seleksi teks & elemen interaktif)         |
+---------------------------------------------------------------------------------+
```

### Prinsip Utama Perancangan:

1. **Ilustrasi Gedung Kampus Riil**:
   - Bagian penutup (*Hero Section*) menampilkan ilustrasi orisinal gedung utama **Universitas Muhammadiyah Cirebon** bergaya ilustrasi komik hangat, dipadukan dengan pohon rindang dan langit cerah. Hal ini memberikan kedekatan emosional (*sense of belonging*) bagi mahasiswa dan dosen setempat.
2. **Gaya Komik Tegas (Solid Border & Hard Shadows)**:
   - Alih-alih bayangan kabur tipis ala template modern, kartu dan tombol menggunakan **garis tepi tegas 2.5px solid navy** dipadukan dengan **bayangan keras 5px tanpa blur** (`box-shadow: 5px 5px 0 var(--navy)`). Ketika tombol ditekan, tombol bergeser 2px (*tactile press feel*), memberikan umpan balik fisik yang memuaskan saat disentuh.
3. **Tipografi Bersahabat & Berkelas**:
   - Judul & Headings: **Baloo 2** — Memberikan karakter ramah, tegas, dan mudah dikenali.
   - Isi Teks & Paragraf: **Nunito** (500–600 weight) — Tingkat keterbacaan (*readability*) tinggi pada dokumen panjang, dokumen jurnal, dan deskripsi tugas.
4. **Tata Letak Bersih & Tidak Memaksa (Editorial Simplicity)**:
   - Halaman Jurnal (`/jurnal`) dan Pendiri (`/pendiri`) mengadopsi format daftar editorial akademik yang bersih: teks judul proporsional, pembatas garis tipis, dan batas lebar teks paragraf maksimal 65 karakter (`max-width: 65ch`) untuk kenyamanan membaca optimal sesuai standar tipografi internasional.
5. **Responsif & Aksesibel**:
   - Navigasi otomatis menciut menjadi menu drawer responsif pada perangkat smartphone dan tablet.
   - Seluruh kontras warna teks terhadap latar belakang telah memenuhi standar aksesibilitas **WCAG 2.1 AA** (kontras rasio di atas 4.5:1 untuk teks biasa).
