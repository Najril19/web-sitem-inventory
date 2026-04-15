# Dokumentasi Sistem Inventori Toko El-Hibbani

## 1. Gambaran Umum Aplikasi

Sistem Inventori Toko El-Hibbani adalah aplikasi manajemen persediaan berbasis web yang digunakan untuk mengelola data barang, supplier, transaksi masuk/keluar, dan laporan inventori. Aplikasi ini menggunakan Next.js 15 dengan Supabase sebagai database backend.

### Teknologi yang Digunakan:
- **Frontend**: Next.js 15, React, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT Token

---

## 2. Fitur Utama Aplikasi

### 2.1 Dashboard
**Lokasi**: `/dashboard`

**Fungsi**:
- Menampilkan statistik ringkas dari sistem inventori
- Total data barang yang terdaftar
- Total stok barang yang tersedia
- Total barang masuk bulan ini
- Total barang keluar bulan ini
- Grafik statistik bulanan barang masuk dan keluar
- Daftar produk teratas berdasarkan transaksi

**Cara Kerja**:
1. Mengambil data dari API `/api/dashboard/statistics`
2. Menghitung total barang, stok, dan transaksi bulan ini
3. Menampilkan data dalam bentuk kartu statistik dan grafik

---

### 2.2 Data Barang
**Lokasi**: `/barang`

**Fungsi**:
- Menampilkan daftar semua barang yang tersedia
- Menambah barang baru
- Mengedit data barang yang sudah ada
- Menghapus barang dari sistem
- Mencari barang berdasarkan nama, kode, merk, atau kategori

**Data yang Dikelola**:
- `id`: ID unik barang (auto-increment)
- `kode_barang`: Kode unik barang
- `nama_barang`: Nama barang
- `merk`: Merek barang
- `kategori`: Kategori barang
- `stok`: Jumlah stok tersedia
- `harga_beli`: Harga beli barang
- `harga_jual`: Harga jual barang
- `satuan`: Satuan barang (pcs, lusin, dll)
- `keterangan`: Keterangan tambahan

**API Endpoints**:
- `GET /api/barang` - Mengambil semua barang
- `POST /api/barang` - Menambah barang baru
- `GET /api/barang/[id]` - Mengambil barang spesifik
- `PUT /api/barang/[id]` - Mengupdate barang
- `DELETE /api/barang/[id]` - Menghapus barang

**Cara Kerja**:
1. **Menampilkan Data**: Fetch dari API dan tampilkan dalam tabel dengan pagination
2. **Tambah Barang**: Klik tombol "Tambah Barang" → Isi form → Submit → Data disimpan ke database
3. **Edit Barang**: Klik icon edit → Form terisi dengan data existing → Edit → Submit → Data diupdate
4. **Hapus Barang**: Klik icon hapus → Konfirmasi → Data dihapus dari database
5. **Pencarian**: Ketik di search bar → Data difilter berdasarkan keyword → Tampilkan hasil

---

### 2.3 Data Supplier
**Lokasi**: `/supplier`

**Fungsi**:
- Menampilkan daftar semua supplier
- Menambah supplier baru
- Mengedit data supplier
- Menghapus supplier
- Mencari supplier berdasarkan nama, kontak, atau alamat

**Data yang Dikelola**:
- `id`: ID unik supplier (auto-increment)
- `nama`: Nama supplier
- `kontak`: Nomor kontak/telepon
- `alamat`: Alamat supplier
- `keterangan`: Keterangan tambahan

**API Endpoints**:
- `GET /api/supplier` - Mengambil semua supplier
- `POST /api/supplier` - Menambah supplier baru
- `GET /api/supplier/[id]` - Mengambil supplier spesifik
- `PUT /api/supplier/[id]` - Mengupdate supplier
- `DELETE /api/supplier/[id]` - Menghapus supplier

**Cara Kerja**:
1. **Menampilkan Data**: Fetch dari API dan tampilkan dalam bentuk kartu
2. **Tambah Supplier**: Klik "Tambah Supplier" → Isi form → Submit → Data disimpan
3. **Edit Supplier**: Klik icon edit → Form terisi → Edit → Submit → Data diupdate
4. **Hapus Supplier**: Klik icon hapus → Konfirmasi → Data dihapus
5. **Pencarian**: Ketik di search bar → Data difilter → Tampilkan hasil

---

### 2.4 Transaksi Barang Masuk
**Lokasi**: `/transaksi-masuk`

**Fungsi**:
- Mencatat barang yang masuk ke toko (restock)
- Menampilkan riwayat transaksi masuk
- Menambah transaksi masuk baru
- Menghitung total barang masuk bulan ini
- Mencari transaksi berdasarkan nama barang, supplier, atau keterangan
- Pagination 20 data per halaman

**Data yang Dikelola**:
- `id`: ID unik transaksi (auto-increment)
- `tanggal`: Tanggal transaksi
- `barang_id`: ID barang yang masuk
- `supplier_id`: ID supplier pengirim
- `jumlah`: Jumlah barang yang masuk
- `keterangan`: Keterangan transaksi

**API Endpoints**:
- `GET /api/transaksi-masuk` - Mengambil semua transaksi masuk
- `POST /api/transaksi-masuk` - Menambah transaksi masuk baru

**Cara Kerja**:
1. **Menampilkan Data**: Fetch dari API dengan JOIN ke tabel barang dan supplier → Tampilkan dalam tabel dengan pagination
2. **Tambah Transaksi**: Klik "Tambah Transaksi" → Pilih tanggal, barang, supplier, jumlah, keterangan → Submit → Stok barang bertambah → Data transaksi disimpan
3. **Auto-update Stok**: Saat transaksi masuk ditambahkan, stok barang akan otomatis bertambah sesuai jumlah
4. **Pencarian**: Ketik di search bar → Filter berdasarkan nama barang, supplier, atau keterangan → Tampilkan hasil dengan pagination
5. **Pagination**: Navigasi antar halaman untuk melihat data lebih banyak

---

### 2.5 Transaksi Barang Keluar
**Lokasi**: `/transaksi-keluar`

**Fungsi**:
- Mencatat barang yang keluar dari toko (penjualan/distribusi)
- Menampilkan riwayat transaksi keluar
- Menambah transaksi keluar baru
- Menghitung total barang keluar bulan ini
- Mencari transaksi berdasarkan nama barang, tujuan, atau keterangan
- Pagination 20 data per halaman

**Data yang Dikelola**:
- `id`: ID unik transaksi (auto-increment)
- `tanggal`: Tanggal transaksi
- `barang_id`: ID barang yang keluar
- `jumlah`: Jumlah barang yang keluar
- `tujuan`: Tujuan pengiriman (penjualan toko, online, dll)
- `keterangan`: Keterangan transaksi

**API Endpoints**:
- `GET /api/transaksi-keluar` - Mengambil semua transaksi keluar
- `POST /api/transaksi-keluar` - Menambah transaksi keluar baru

**Cara Kerja**:
1. **Menampilkan Data**: Fetch dari API dengan JOIN ke tabel barang → Tampilkan dalam tabel dengan pagination
2. **Tambah Transaksi**: Klik "Tambah Transaksi" → Pilih tanggal, barang, jumlah, tujuan, keterangan → Submit → Stok barang berkurang → Data transaksi disimpan
3. **Auto-update Stok**: Saat transaksi keluar ditambahkan, stok barang akan otomatis berkurang sesuai jumlah
4. **Validasi Stok**: Sistem akan memvalidasi bahwa stok mencukupi sebelum mengizinkan transaksi keluar
5. **Pencarian**: Ketik di search bar → Filter berdasarkan nama barang, tujuan, atau keterangan → Tampilkan hasil dengan pagination
6. **Pagination**: Navigasi antar halaman untuk melihat data lebih banyak

---

### 2.6 Laporan
**Lokasi**: `/laporan`

**Fungsi**:
- Menampilkan berbagai jenis laporan inventori
- Laporan Data Barang
- Laporan Barang Masuk
- Laporan Barang Keluar
- Laporan Stok Akhir
- Filter berdasarkan tanggal (untuk laporan transaksi)
- Cetak laporan

**Jenis Laporan**:
1. **Laporan Data Barang**: Menampilkan semua barang dengan kode, nama, merk, stok, dan harga
2. **Laporan Barang Masuk**: Menampilkan semua transaksi masuk dengan tanggal, nama barang, jumlah, dan supplier
3. **Laporan Barang Keluar**: Menampilkan semua transaksi keluar dengan tanggal, nama barang, jumlah, dan tujuan
4. **Laporan Stok Akhir**: Menampilkan stok akhir setelah semua transaksi

**Cara Kerja**:
1. **Pilih Jenis Laporan**: Klik salah satu tombol laporan (Barang, Masuk, Keluar, Stok)
2. **Filter Tanggal**: Untuk laporan Masuk dan Keluar, bisa filter berdasarkan rentang tanggal
3. **Tampilkan Data**: Data diambil dari API dan ditampilkan dalam tabel format laporan
4. **Cetak Laporan**: Klik tombol "Cetak Laporan" → Browser print dialog muncul → Pilih format (PDF/Print) → Cetak

---

## 3. Authentication & Authorization

### 3.1 Login
**Lokasi**: `/login`

**Fungsi**:
- Login ke sistem dengan username dan password
- Validasi kredensial
- Generate JWT token untuk sesi

**API Endpoint**:
- `POST /api/auth/login` - Login dan dapatkan token

**Cara Kerja**:
1. User input username dan password
2. Data dikirim ke API
3. API validasi kredensial di database
4. Jika valid, JWT token di-generate dan dikirim ke client
5. Token disimpan di localStorage
6. User di-redirect ke dashboard

### 3.2 Logout
**Fungsi**:
- Logout dari sistem
- Hapus token dari localStorage
- Redirect ke halaman login

**Cara Kerja**:
1. User klik tombol logout
2. Token dihapus dari localStorage
3. User di-redirect ke halaman login

### 3.3 Profile
**Lokasi**: `/profile`

**Fungsi**:
- Melihat profil user
- Mengubah password

**API Endpoints**:
- `GET /api/auth/profile` - Mengambil data profil
- `POST /api/auth/change-password` - Mengubah password

---

## 4. Database Management

### 4.1 Backup Database
**API Endpoint**: `POST /api/database/backup`

**Fungsi**:
- Membuat backup semua data dari database
- Data di-export dalam format JSON
- Termasuk data dari semua tabel (users, supplier, barang, transaksi_masuk, transaksi_keluar)

**Cara Kerja**:
1. API mengambil semua data dari semua tabel
2. Data di-gabungkan dalam format JSON
3. Response berisi backup data dengan timestamp

### 4.2 Clear Data
**API Endpoint**: `DELETE /api/database/clear`

**Fungsi**:
- Menghapus semua data dari database (cascade delete)
- Opsi backup sebelum menghapus
- Menghapus data dari tabel: transaksi_masuk, transaksi_keluar, barang, supplier
- User admin tetap tersedia

**Cara Kerja**:
1. Jika backup=true, buat backup terlebih dahulu
2. Hapus data dari transaksi_masuk
3. Hapus data dari transaksi_keluar
4. Hapus data dari barang
5. Hapus data dari supplier
6. Return hasil operasi dengan status setiap tabel

---

## 5. Struktur Database

### 5.1 Tabel Users
```sql
- id (integer, primary key)
- username (string, unique)
- password (string, hashed)
- full_name (string)
- role (string)
- created_at (timestamp)
- updated_at (timestamp)
```

### 5.2 Tabel Supplier
```sql
- id (integer, primary key)
- nama (string)
- kontak (string)
- alamat (text)
- keterangan (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 5.3 Tabel Barang
```sql
- id (integer, primary key)
- kode_barang (string, unique)
- nama_barang (string)
- merk (string)
- kategori (string)
- stok (integer, default 0)
- harga_beli (integer)
- harga_jual (integer)
- satuan (string)
- keterangan (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### 5.4 Tabel Transaksi Masuk
```sql
- id (integer, primary key)
- tanggal (date)
- barang_id (integer, foreign key ke barang)
- supplier_id (integer, foreign key ke supplier)
- jumlah (integer)
- keterangan (text)
- created_at (timestamp)
```

### 5.5 Tabel Transaksi Keluar
```sql
- id (integer, primary key)
- tanggal (date)
- barang_id (integer, foreign key ke barang)
- jumlah (integer)
- tujuan (string)
- keterangan (text)
- created_at (timestamp)
```

---

## 6. Alur Kerja Sistem

### 6.1 Alur Menambah Barang
1. Login ke sistem
2. Masuk ke menu Data Barang
3. Klik "Tambah Barang"
4. Isi form (kode, nama, merk, kategori, stok awal, harga, satuan, keterangan)
5. Submit form
6. Data disimpan ke database
7. Data muncul di tabel

### 6.2 Alur Barang Masuk (Restock)
1. Login ke sistem
2. Masuk ke menu Transaksi Masuk
3. Klik "Tambah Transaksi"
4. Pilih tanggal
5. Pilih barang dari dropdown
6. Pilih supplier dari dropdown
7. Input jumlah barang yang masuk
8. Input keterangan (opsional)
9. Submit form
10. Stok barang otomatis bertambah
11. Data transaksi disimpan
12. Data muncul di tabel

### 6.3 Alur Barang Keluar (Penjualan)
1. Login ke sistem
2. Masuk ke menu Transaksi Keluar
3. Klik "Tambah Transaksi"
4. Pilih tanggal
5. Pilih barang dari dropdown
6. Input jumlah barang yang keluar
7. Input tujuan (penjualan toko/online/dll)
8. Input keterangan (opsional)
9. Submit form
10. Sistem validasi stok cukup
11. Stok barang otomatis berkurang
12. Data transaksi disimpan
13. Data muncul di tabel

### 6.4 Alur Membuat Laporan
1. Login ke sistem
2. Masuk ke menu Laporan
3. Pilih jenis laporan (Barang/Masuk/Keluar/Stok)
4. Untuk laporan transaksi, filter rentang tanggal (opsional)
5. Laporan ditampilkan dalam format tabel
6. Klik "Cetak Laporan"
7. Pilih format output (PDF/Printer)
8. Cetak laporan

---

## 7. Fitur Keamanan

### 7.1 Authentication
- JWT Token untuk sesi
- Password di-hash sebelum disimpan
- Token disimpan di localStorage
- Token dikirim di header Authorization untuk setiap request

### 7.2 Authorization
- Middleware authenticate untuk memvalidasi token
- Setiap API route dilindungi dengan middleware
- User harus login untuk mengakses fitur

### 7.3 Input Validation
- Validasi input di frontend
- Validasi input di backend
- Cek duplikasi kode barang
- Cek stok cukup sebelum transaksi keluar

---

## 8. Cara Penggunaan Aplikasi

### 8.1 Login
1. Buka aplikasi di browser
2. Input username dan password
3. Klik Login
4. Jika berhasil, akan di-redirect ke Dashboard

### 8.2 Dashboard
- Lihat statistik dan grafik
- Navigasi ke menu lain melalui sidebar

### 8.3 Mengelola Barang
1. Masuk menu Data Barang
2. Lihat daftar barang
3. Tambah/Edit/Hapus sesuai kebutuhan
4. Gunakan search untuk mencari barang

### 8.4 Mengelola Supplier
1. Masuk menu Data Supplier
2. Lihat daftar supplier
3. Tambah/Edit/Hapus sesuai kebutuhan
4. Gunakan search untuk mencari supplier

### 8.5 Transaksi Masuk
1. Masuk menu Transaksi Masuk
2. Lihat riwayat transaksi masuk
3. Tambah transaksi baru untuk restock
4. Gunakan search dan pagination untuk navigasi

### 8.6 Transaksi Keluar
1. Masuk menu Transaksi Keluar
2. Lihat riwayat transaksi keluar
3. Tambah transaksi baru untuk penjualan
4. Gunakan search dan pagination untuk navigasi

### 8.7 Laporan
1. Masuk menu Laporan
2. Pilih jenis laporan
3. Filter tanggal jika perlu
4. Cetak laporan untuk dokumentasi

---

## 9. Troubleshooting

### 9.1 Tidak Bisa Login
- Pastikan username dan password benar
- Cek koneksi internet
- Hubungi admin untuk reset password

### 9.2 Data Tidak Muncul
- Cek koneksi ke Supabase
- Refresh halaman
- Cek console untuk error message
- Pastikan sudah login

### 9.3 Stok Tidak Terupdate
- Refresh halaman transaksi
- Cek apakah transaksi berhasil disimpan
- Cek database langsung

---

## 10. Kontak & Support

Untuk bantuan lebih lanjut, hubungi:
- Admin Sistem
- Tim IT Support

---

*Dokumentasi ini dibuat pada April 2026*
*Sistem Inventori Toko El-Hibbani v1.0*
