# SIM-GA (Sistem Informasi Manajemen Inventaris & General Affairs)

Aplikasi manajemen operasional GA, aset kantor, sirkulasi peminjaman barang, cetak label stiker QR code, dan otomasi jadwal pemeliharaan rutin.

---

## Panduan Deploy ke Vercel via GitHub

Aplikasi ini sudah dipersiapkan dan dioptimalkan secara penuh untuk di-deploy ke **Vercel** dengan arsitektur **Vite SPA + Vercel Serverless Functions (`/api`)**.

### 1. Push ke GitHub & Import ke Vercel
1. Buat repositori baru di GitHub Anda dan push kode ini.
2. Buka [Vercel Dashboard](https://vercel.com) → klik **Add New...** → **Project**.
3. Pilih repositori GitHub Anda.
4. Vercel akan otomatis mendeteksi pengaturan dari `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **Deploy**.

---

### 2. Cara Agar Data Tersimpan Permanen di Vercel (Pilihan Cloud Database)

Vercel menggunakan arsitektur serverless (fungsi tanpa server statis). Agar data Anda tersimpan permanen dan dapat diakses bersamaan oleh banyak staf lintas perangkat, gunakan salah satu metode berikut:

#### Opsi Rekomendasi: Vercel KV (1-Klik Tanpa Kode Tambahan)
1. Di halaman proyek Anda di **Vercel Dashboard**, buka tab **Storage**.
2. Klik **Create Database** lalu pilih **KV (Serverless Redis)**.
3. Beri nama (misal: `ga-inventory-kv`) dan klik **Create**.
4. Di bagian **Connect to Project**, pilih proyek SIM-GA Anda dan klik **Connect**.
5. Vercel akan otomatis menyuntikkan variabel environment:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
6. Lakukan Redeploy (atau deploy ulang commit terbaru). Backend `/api/_db.ts` akan otomatis mendeteksi KV dan menyimpan seluruh data aset, peminjaman, dan servis ke cloud secara instan!

---

### 3. Proteksi Data Dual-Sync & Cadangan Offline
Bahkan jika Anda belum menyambungkan Vercel KV:
- **Dual-Sync**: Data yang Anda input akan otomatis tersimpan di peramban (LocalStorage) dan dikirim ke server. Jika container serverless Vercel mengalami cold start, aplikasi di peramban Anda akan secara otomatis menyinkronkan kembali data tersebut ke server.
- **Cadangan JSON (Backup & Restore)**: Di menu Pengaturan (ikon gear di samping nama perusahaan pada menu kiri), terdapat fitur **Unduh Backup JSON** dan **Pulihkan dari JSON** untuk mengamankan salinan database kapan pun.

---

### Akun Default
- **Super Admin**: username: `admin` | password: `admin`
- **Koordinator GA**: username: `syahnur` | password: `password123`
*(Anda juga dapat mendaftarkan akun staf baru langsung dari form registrasi)*
