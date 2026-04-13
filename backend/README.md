# Backend API - Sistem Inventori El-Hibbani

Backend REST API untuk sistem inventori menggunakan Express.js, TypeScript, dan SQLite.

## 🚀 Fitur

- ✅ Autentikasi JWT
- ✅ CRUD Data Barang
- ✅ CRUD Data Supplier
- ✅ Transaksi Barang Masuk (dengan update stok otomatis)
- ✅ Transaksi Barang Keluar (dengan validasi stok)
- ✅ Dashboard Statistics
- ✅ Database SQLite
- ✅ TypeScript

## 📦 Instalasi

```bash
cd backend
npm install
```

## 🛠️ Setup Database

Inisialisasi database dan seed data:

```bash
npm run init-db
```

Ini akan membuat:
- Database SQLite (`database.sqlite`)
- Tabel-tabel yang diperlukan
- User admin default (username: `admin`, password: `admin123`)
- Sample data barang dan supplier

## 🏃 Menjalankan Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📚 API Endpoints

### Authentication

#### POST `/api/auth/login`
Login user dan dapatkan JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrator",
    "role": "admin"
  }
}
```

#### GET `/api/auth/profile`
Dapatkan profile user yang sedang login.

**Headers:**
```
Authorization: Bearer <token>
```

### Barang

#### GET `/api/barang`
Dapatkan semua data barang.

#### GET `/api/barang/:id`
Dapatkan data barang berdasarkan ID.

#### POST `/api/barang`
Tambah barang baru.

**Request Body:**
```json
{
  "kode_barang": "BRG006",
  "nama_barang": "Koko Premium",
  "merk": "Brand X",
  "kategori": "Pakaian Muslim",
  "stok": 100,
  "harga_beli": 200000,
  "harga_jual": 250000,
  "satuan": "Pcs",
  "keterangan": "Keterangan optional"
}
```

#### PUT `/api/barang/:id`
Update data barang.

#### DELETE `/api/barang/:id`
Hapus barang.

### Supplier

#### GET `/api/supplier`
Dapatkan semua data supplier.

#### GET `/api/supplier/:id`
Dapatkan data supplier berdasarkan ID.

#### POST `/api/supplier`
Tambah supplier baru.

**Request Body:**
```json
{
  "nama": "PT Supplier Baru",
  "kontak": "021-1234567",
  "alamat": "Jakarta",
  "keterangan": "Keterangan optional"
}
```

#### PUT `/api/supplier/:id`
Update data supplier.

#### DELETE `/api/supplier/:id`
Hapus supplier.

### Transaksi Masuk

#### GET `/api/transaksi-masuk`
Dapatkan semua transaksi barang masuk.

#### GET `/api/transaksi-masuk/:id`
Dapatkan transaksi masuk berdasarkan ID.

#### POST `/api/transaksi-masuk`
Tambah transaksi barang masuk (stok barang akan otomatis bertambah).

**Request Body:**
```json
{
  "tanggal": "2026-04-13",
  "barang_id": 1,
  "supplier_id": 1,
  "jumlah": 50,
  "harga_satuan": 200000,
  "keterangan": "Restok bulanan"
}
```

#### DELETE `/api/transaksi-masuk/:id`
Hapus transaksi masuk (stok barang akan dikembalikan).

#### GET `/api/transaksi-masuk/statistics/summary`
Dapatkan ringkasan statistik transaksi masuk bulan ini.

### Transaksi Keluar

#### GET `/api/transaksi-keluar`
Dapatkan semua transaksi barang keluar.

#### GET `/api/transaksi-keluar/:id`
Dapatkan transaksi keluar berdasarkan ID.

#### POST `/api/transaksi-keluar`
Tambah transaksi barang keluar (stok barang akan otomatis berkurang, dengan validasi stok mencukupi).

**Request Body:**
```json
{
  "tanggal": "2026-04-13",
  "barang_id": 1,
  "jumlah": 15,
  "tujuan": "Penjualan Toko",
  "keterangan": "Penjualan retail"
}
```

#### DELETE `/api/transaksi-keluar/:id`
Hapus transaksi keluar (stok barang akan dikembalikan).

#### GET `/api/transaksi-keluar/statistics/summary`
Dapatkan ringkasan statistik transaksi keluar bulan ini.

### Dashboard

#### GET `/api/dashboard/statistics`
Dapatkan statistik lengkap untuk dashboard:
- Total barang
- Total stok
- Barang masuk bulan ini
- Barang keluar bulan ini
- Top 5 barang berdasarkan stok
- Statistik bulanan (6 bulan terakhir)

## 🔐 Authentication

Semua endpoint (kecuali `/api/auth/login`) memerlukan JWT token di header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 Struktur Database

### Table: users
- id (PK)
- username (UNIQUE)
- password (hashed)
- full_name
- role
- created_at
- updated_at

### Table: barang
- id (PK)
- kode_barang (UNIQUE)
- nama_barang
- merk
- kategori
- stok
- harga_beli
- harga_jual
- satuan
- keterangan
- created_at
- updated_at

### Table: supplier
- id (PK)
- nama
- kontak
- alamat
- keterangan
- created_at
- updated_at

### Table: transaksi_masuk
- id (PK)
- tanggal
- barang_id (FK)
- supplier_id (FK)
- jumlah
- harga_satuan
- total_harga
- keterangan
- created_by (FK)
- created_at
- updated_at

### Table: transaksi_keluar
- id (PK)
- tanggal
- barang_id (FK)
- jumlah
- tujuan
- keterangan
- created_by (FK)
- created_at
- updated_at

## 🔧 Environment Variables

File `.env`:
```env
PORT=5000
JWT_SECRET=el-hibbani-inventory-secret-key-2026-change-in-production
NODE_ENV=development
DATABASE_PATH=./database.sqlite
```

## 📝 Notes

1. **Stok Otomatis**: 
   - Saat transaksi masuk dibuat, stok barang otomatis bertambah
   - Saat transaksi keluar dibuat, stok barang otomatis berkurang
   - Validasi stok mencukupi sebelum transaksi keluar

2. **Soft Delete**: 
   - Saat transaksi dihapus, stok barang akan dikembalikan ke kondisi semula

3. **Foreign Keys**: 
   - Database menggunakan foreign key constraints
   - Cascade delete untuk menjaga integritas data

## 🧪 Testing dengan Postman/Thunder Client

1. Login untuk mendapatkan token:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

2. Copy token dari response

3. Gunakan token untuk endpoint lain:
```bash
GET http://localhost:5000/api/barang
Authorization: Bearer <your-token-here>
```

## 📞 Support

Untuk pertanyaan atau issue, silakan hubungi developer.
