# Laporan Perbaikan Arsitektur & Dekopling Layanan Eksternal

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Refaktorisasi Arsitektur Perangkat Lunak  
> - **Komponen Inti:** `src/lib/api.js`, `src/context/AuthContext.jsx`, `src/components/RequireAuth.jsx`  

---

## 1. Masalah Ketergantungan Eksternal (Tight Coupling)

Pada rilis v1.0, komponen React mengimpor instansi client Supabase secara langsung ke dalam puluhan berkas UI:
```javascript
// POLA LAMA YANG MENGAKIBATKAN COUPLING TINGGI:
import { supabase } from '../../config/supabase';

const { data } = await supabase.from('assignments').select('*');
```
Kelemahan pola ini:
- **Pelanggaran Prinsip Single Responsibility**: Komponen antarmuka (UI) bercampur aduk dengan kueri database tingkat rendah.
- **Sulit Diuji (Untestable)**: Tidak dapat dilakukan *unit testing* atau *mocking* tanpa memanggil server eksternal nyata.
- **Keterikatan Vendor (Vendor Lock-in)**: Struktur tabel dan otorisasi bergantung sepenuhnya pada infrastruktur cloud Supabase.

---

## 2. Refaktorisasi: Menghapus Pustaka Supabase & Dekopling Total

Langkah-langkah refaktorisasi yang telah diselesaikan:

1. **Pencabutan Pustaka `@supabase/supabase-js`**:
   - Pustaka SDK Supabase telah di-uninstall sepenuhnya dari `package.json` frontend.
   - Berkas konfigurasi `src/config/supabase.js` telah dihapus.
2. **Pembangunan Klien HTTP Khusus (`src/lib/api.js`)**:
   - Membangun antarmuka terpusat berbasis native `fetch` yang menangani:
     - Penambahan header `Authorization: Bearer <token>` secara otomatis.
     - Penanganan transmisi cookie (`credentials: 'include'`).
     - **Intersepsi Kadaluarsa Token Transparan**: Jika server merespon dengan status `401 Unauthorized`, klien API secara otomatis memanggil `/api/auth/refresh` di latar belakang, memperbarui token di memori, dan mengulang kembali kueri pengguna yang gagal tanpa mengganggu interaksi layar pengguna.
     - Penanganan unggah berkas (`multipart/form-data`) terpadu via `api.upload(file)`.
3. **Pengelolaan State Autentikasi Global (`src/context/AuthContext.jsx`)**:
   - Menyediakan React Context yang membungkus seluruh aplikasi:
     - `user`: Data profil pengguna aktif (`id`, `name`, `email`, `role`).
     - `ready`: Penanda status pemeriksaan sesi awal selesai dimuat.
     - `login(email, password)`: Masuk akun dan simpan access token ke memori.
     - `register(payload)`: Pendaftaran mahasiswa mandiri.
     - `logout()`: Bersihkan sesi dan token cookie.
     - `isStaff`: Nilai boolean pembantu (`role === 'admin' || role === 'dosen'`).
     - `isAdmin`: Nilai boolean pembantu (`role === 'admin'`).
4. **Perlindungan Rute (`src/components/RequireAuth.jsx`)**:
   - Komponen penjaga rute (*route guard*) yang melindungi dashboard administrasi dari akses pengunjung tanpa hak. Mengalihkan pengguna yang belum masuk ke halaman `/login` dengan menyimpan riwayat rute tujuan asal (*state from*).

---

## 3. Sistem Audit Log Penghapusan Berkas (`deletion_logs`)

Untuk menjaga integritas dan akuntabilitas data akademik:
- Setiap penghapusan tugas, materi modul, maupun artikel blog kini **wajib mencantumkan alasan penghapusan** melalui dialog konfirmasi.
- Backend mencatat secara permanen ke dalam tabel `deletion_logs`:
  - `item_type`: Tipe item yang dihapus (Tugas / Materi / Blog / Jurnal).
  - `item_title`: Judul berkas yang dihapus.
  - `deleted_by`: Nama lengkap dan peran akun yang mengeksekusi penghapusan.
  - `reason`: Alasan penghapusan yang diberikan.
  - `deleted_at`: Waktu penghapusan tercatat presisi.
- Catatan ini dapat dipantau oleh Dosen dan Administrator melalui **Dashboard -> Tab Riwayat Hapus**.
