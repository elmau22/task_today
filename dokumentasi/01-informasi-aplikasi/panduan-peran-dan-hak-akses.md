# Panduan Peran Pengguna & Manajemen Hak Akses (RBAC)

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Kebijakan Akses & Otorisasi Pengguna  
> - **Tingkat Akses:** Publik, Pengguna Terdaftar, Dosen, & Administrator  

---

## 1. Definisi Peran Pengguna (User Roles)

Sistem Task Today menerapkan arsitektur **Role-Based Access Control (RBAC)** dengan tiga tingkatan hak akses yang terisolasi secara ketat di sisi backend:

```
                  +--------------------------------+
                  |         ADMINISTRATOR          |
                  |  (Kendali Penuh Seluruh Sistem)|
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |             DOSEN              |
                  |  (Modul Materi & Review Jurnal)|
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |           MAHASISWA            |
                  |  (Tugas Pribadi & Kirim Jurnal)|
                  +--------------------------------+
                                  |
                                  v
                  +--------------------------------+
                  |       PENGUNJUNG PUBLIK        |
                  |  (Baca Materi, Jurnal Terbit)  |
                  +--------------------------------+
```

### 1. Mahasiswa (`mahasiswa`)
- Siswa/peserta didik yang terdaftar dalam portal.
- **Wewenang**:
  - Mengunggah dan memperbarui tugas perkuliahan miliknya sendiri.
  - Membaca seluruh modul materi perkuliahan dan artikel blog.
  - Mengirimkan naskah jurnal ilmiah untuk ditinjau oleh Dosen/Admin.
  - Mengunduh naskah publikasi dan dokumen materi kuliah.
- **Batasan**:
  - Tidak dapat mengedit atau menghapus tugas milik mahasiswa lain.
  - Tidak dapat menambahkan atau mengubah modul materi kuliah.
  - Tidak dapat langsung menerbitkan jurnal ilmiah ke publik tanpa penelaahan (status otomatis `pending`).
  - Tidak dapat mengakses log sistem, daftar pengguna, atau data pesan kontak.

### 2. Dosen (`dosen`)
- Tenaga pendidik atau pengampu mata kuliah.
- **Wewenang**:
  - Seluruh hak akses Mahasiswa.
  - Mengelola modul materi perkuliahan per pertemuan (tambah, edit, tandai featured, hapus).
  - Mengelola artikel blog dan analisis teknologi.
  - Mengunggah naskah jurnal ilmiah (otomatis langsung terbit ke publik / `published`).
  - **Menelaah naskah jurnal mahasiswa**: Menyetujui/menerbitkan (`published`), menolak dengan catatan perbaikan (`rejected`), atau menarik naskah (`pending`).
  - Mengakses log riwayat penghapusan berkas (`deletion_logs`).
  - Membantu meninjau tugas mahasiswa dari seluruh mata kuliah.
- **Batasan**:
  - Tidak dapat mengelola akun pengguna lain atau mengubah struktur hak akses.
  - Tidak dapat mengelola data profil pendiri portal.
  - Tidak dapat membaca pesan formulir kontak admin.

### 3. Administrator (`admin`)
- Pengelola teknis tertinggi sistem Task Today.
- **Wewenang**:
  - Seluruh hak akses Dosen dan Mahasiswa.
  - **Manajemen Pengguna**: Menambahkan akun dosen/admin baru, mengubah peran akun, mereset kata sandi, mengaktifkan/menonaktifkan pengguna, serta menghapus akun.
  - **Manajemen Pendiri**: Mengelola data nama, foto profil, posisi, biografi, email, dan LinkedIn pendiri pada rute `/pendiri`.
  - **Manajemen Pesan Kontak**: Membaca, menandai, dan menghapus pesan masuk dari formulir kontak web.
  - Menetapkan tugas atau materi unggulan (*is_featured*) untuk ditampilkan di beranda utama.

---

## 2. Matriks Hak Akses (RBAC Permission Matrix)

| Fitur / Tindakan | Publik | Mahasiswa | Dosen | Admin |
|:---|:---:|:---:|:---:|:---:|
| **Melihat Halaman Beranda, Materi, Tugas, Blog** | ✅ | ✅ | ✅ | ✅ |
| **Melihat Jurnal Ilmiah Berstatus Terbit** | ✅ | ✅ | ✅ | ✅ |
| **Melihat Halaman Pendiri (`/pendiri`)** | ✅ | ✅ | ✅ | ✅ |
| **Kirim Formulir Kontak (ke info@lokalkreatif.com)** | ✅ | ✅ | ✅ | ✅ |
| **Pendaftaran Mandiri Akun Baru** | ✅ (Mhs) | ❌ | ❌ | ❌ |
| **Kumpul Tugas Baru** | ❌ | ✅ | ✅ | ✅ |
| **Ubah / Hapus Tugas Sendiri** | ❌ | ✅ | ✅ | ✅ |
| **Ubah / Hapus Tugas Mahasiswa Lain** | ❌ | ❌ | ✅ | ✅ |
| **Kirim Naskah Jurnal Ilmiah** | ❌ | ✅ (Pending) | ✅ (Langsung Terbit) | ✅ (Langsung Terbit) |
| **Review / Terbitkan / Tolak Naskah Jurnal** | ❌ | ❌ | ✅ | ✅ |
| **Tambah, Ubah, Hapus Modul Materi Perkuliahan** | ❌ | ❌ | ✅ | ✅ |
| **Tambah, Ubah, Hapus Artikel Blog** | ❌ | ❌ | ✅ | ✅ |
| **Melihat Log Penghapusan Berkas (`deletion_logs`)** | ❌ | ❌ | ✅ | ✅ |
| **Kelola Profil Pendiri (Tambah/Edit/Hapus)** | ❌ | ❌ | ❌ | ✅ |
| **Kelola Pengguna (Tambah Dosen/Admin/Reset Sandi)** | ❌ | ❌ | ❌ | ✅ |
| **Membaca & Mengelola Pesan Kontak Masuk** | ❌ | ❌ | ❌ | ✅ |

---

## 3. Mekanisme Pendaftaran & Keamanan Akun

1. **Self-Service Registration (Khusus Mahasiswa)**:
   - Rute API: `POST /api/auth/register`
   - Siapa pun dapat mendaftar mandiri dengan mengisi Nama Lengkap, NIM, Email, dan Kata Sandi.
   - Peran akun yang dihasilkan **dikunci permanen pada tingkat `mahasiswa`** di sisi backend. Calon pengguna tidak dapat memanipulasi payload HTTP untuk menjadi dosen atau admin.

2. **Staff Provisioning (Dosen & Admin)**:
   - Rute API: `POST /api/users` (Memerlukan header Authorization dengan role `admin`).
   - Akun dengan peran `dosen` dan `admin` **hanya dapat diciptakan oleh Administrator yang sedang login** melalui tab "Pengguna" di Dashboard.

3. **Perlindungan Akun Mandiri (Self-Protection Safeguard)**:
   - Administrator dicegah secara logika backend untuk menurunkan perannya sendiri (`demote self`) atau menonaktifkan akunnya sendiri agar sistem tidak mengalami kondisi *lockout* (kehilangan seluruh admin).
   - Penggantian kata sandi atau perubahan status akun otomatis membatalkan seluruh *refresh token* aktif yang tersimpan di database untuk akun terkait.
