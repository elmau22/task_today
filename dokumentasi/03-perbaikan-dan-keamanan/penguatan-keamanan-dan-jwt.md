# Laporan Penguatan Keamanan Sistem & Implementasi JWT

> **Metadata Dokumen:**  
> - **Tahun:** 2026  
> - **Tanggal:** 01 November 2026  
> - **Waktu / Jam:** 22:20:00 WIB (GMT+7)  
> - **Status Dokumen:** Audit & Peningkatan Standar Keamanan OWASP  
> - **Tingkat Prioritas:** Kritikal / High-Security  

---

## 1. Analisis Kerentanan Sistem Sebelumnya

Sebelum pembaruan versi 2.0, audit internal menemukan beberapa celah keamanan (*vulnerabilities*) yang sangat berisiko:

1. **Kredensial Tertanam di Kode Sumber Frontend (Hardcoded Auth)**:
   - Pada berkas `LoginPage.jsx` lama, otentikasi hanya berupa pengecekan kondisi statis JavaScript di browser:
     ```javascript
     // KODE LAMA YANG TIDAK AMAN:
     const isValidName = cleanName === 'elmau22' || cleanName === 'mohamad farael maulana';
     const isValidNim = cleanNim === '240511086';
     ```
   - Siapa pun yang membuka tab *Sources* di browser dapat membaca nama dan NIM yang diizinkan masuk, lalu memalsukan sesi login secara lokal.
2. **Sesi Disimpan pada LocalStorage Tanpa Enkripsi**:
   - Sesi login disimpan di `localStorage.setItem('portal_user_session', ...)`.
   - Data di LocalStorage rentan disusupi dan dicuri (*token theft*) melalui serangan Cross-Site Scripting (XSS).
3. **Ketiadaan Otorisasi Server-Side**:
   - Karena tidak ada backend yang memverifikasi identitas pengguna, operasi penambahan dan penghapusan data mengandalkan kunci anonim Supabase langsung dari browser.

---

## 2. Arsitektur Keamanan Baru: Dual-Token JWT

Sistem telah dirombak total menggunakan standar industri **JSON Web Token (JWT) Dual-Token Architecture**:

```
+---------------+                                           +---------------+
|    BROWSER    |                                           |    SERVER     |
+---------------+                                           +---------------+
        |                                                           |
        | 1. POST /api/auth/login (Email & Password)                |
        |---------------------------------------------------------->|
        |                                                           |-- Cek Bcrypt Hash
        |                                                           |-- Buat Access Token (15m)
        |                                                           |-- Buat Refresh Token (7d)
        | 2. Response: Access Token di Body JSON                    |-- Simpan jti ke SQLite
        |    + Set-Cookie: tt_refresh (HttpOnly, SameSite=Strict)   |
        |<----------------------------------------------------------|
        |                                                           |
        | 3. Request API: Header "Authorization: Bearer <token>"     |
        |---------------------------------------------------------->|-- Verifikasi JWT & Role
        |                                                           |
        | 4. Sesi Access Token Kadaluarsa (15 Menit)                |
        |    Otomatis kirim: POST /api/auth/refresh (via Cookie)    |
        |---------------------------------------------------------->|-- Cek jti di database
        |                                                           |-- Putar (Rotate) Token Baru
        | 5. Menerima Access Token baru tanpa logout paksa          |-- Batalkan token lama
        |<----------------------------------------------------------|
```

### A. Access Token (Umur Pendek — 15 Menit)
- **Lokasi Penyimpanan**: Disimpan **hanya di memori variabel JavaScript klien** (`accessToken` pada `src/lib/api.js`).
- **Tidak Disimpan di LocalStorage atau SessionStorage**: Kebijakan ini menjamin bahwa serangan XSS di masa mendatang tidak dapat mengekstrak token otentikasi pengguna secara permanen.
- **Payload Token**: Memuat identitas pengguna (`sub`) dan peran yang diizinkan (`role`), ditandatangani menggunakan algoritma kriptografi HMAC-SHA256 dengan secret key 48-byte acak.

### B. Rotating Refresh Token (Umur Panjang — 7 Hari)
- **Lokasi Penyimpanan**: Dikirimkan oleh server melalui HTTP Header `Set-Cookie` dengan atribut:
  - `HttpOnly`: Skrip JavaScript di browser tidak dapat membaca atau memanipulasi cookie ini sama sekali.
  - `SameSite=Strict`: Mencegah serangan Cross-Site Request Forgery (CSRF).
  - `Path=/api/auth`: Cookie hanya otomatis dikirimkan oleh browser saat mengakses endpoint autentikasi.
- **Rotasi Token Otomatis (Automatic Token Rotation)**:
  Setiap kali token penyegar digunakan untuk meminta access token baru, token penyegar lama seketika ditandai `revoked = 1` di tabel `refresh_tokens`, dan diterbitkan token penyegar pengganti. Jika ada pihak yang mencoba memakai ulang token lama, server mendeteksi anomali tersebut dan membatalkan seluruh sesi terkait.

---

## 3. Pengamanan Kata Sandi (Password Hashing via Bcrypt)

- Seluruh kata sandi pengguna dienkripsi searah menggunakan pustaka **Bcrypt** dengan salt round **12**:
  ```javascript
  const passwordHash = bcrypt.hashSync(plainPassword, 12);
  ```
- Waktu komputasi sengaja dirancang tahan terhadap akselerasi GPU (perlu waktu ~250–300ms per verifikasi hash).
- Dilengkapi mekanisme *dummy compare* untuk mencegah serangan kebocoran waktu (*timing attack*): jika email pengguna tidak ditemukan, server tetap menjalankan pembandingan hash palsu sebelum mengembalikan respon gagal.

---

## 4. Perlindungan Lapisan Jaringan & Penyerangan

1. **Rate Limiting (Pencegahan Brute-Force & DoS)**:
   - Endpoint `/api/auth/login` dan `/api/auth/register` dibatasi maksimal **20 percobaan per 15 menit** per alamat IP.
   - Endpoint `/api/contact` dibatasi maksimal **5 pengiriman per jam** per IP.
2. **Keamanan Header HTTP (Helmet)**:
   - Menyematkan header keamanan OWASP standar: `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, dan `Strict-Transport-Security`.
3. **Validasi Skema Input Waktu-Nyata (Zod)**:
   - Seluruh payload yang masuk divalidasi format dan panjang karakternya sebelum diproses oleh database (mencegah Buffer Overflow dan Malformed Inputs).
4. **Honeypot Anti-Bot**:
   - Kolom tersembunyi `website` pada formulir kontak yang tidak terlihat oleh mata manusia namun sering diisi oleh bot scraper; jika terisi, server secara diam-diam mengabaikan kiriman tersebut.
