# 🚀 Panduan Setup Backend

## 1. Install Dependencies

Buka terminal di folder `backend`, lalu jalankan:

```bash
cd backend
npm install
```

## 2. Inisialisasi Database

Setelah install selesai, jalankan perintah ini untuk membuat database SQLite dan seed data:

```bash
npm run init-db
```

Output yang akan muncul:
```
✓ Default admin user created (username: admin, password: admin123)
✓ Inserted 4 sample suppliers
✓ Inserted 5 sample barang
✓ Database initialized successfully
Database initialization complete!
```

## 3. Jalankan Server

### Mode Development (dengan auto-reload)
```bash
npm run dev
```

### Mode Production
```bash
npm run build
npm start
```

Server akan berjalan di: **http://localhost:5000**

## 4. Test API

### Login
Gunakan Postman, Thunder Client, atau curl:

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response akan memberikan **token JWT** yang digunakan untuk endpoint lainnya.

### Test Endpoint Lain

Copy token dari login, lalu:

```bash
GET http://localhost:5000/api/barang
Authorization: Bearer <paste-token-disini>
```

## 📁 Struktur Folder Backend

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection
│   ├── database/
│   │   ├── init.ts              # Database initialization script
│   │   └── schema.ts            # Database schema & seeds
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts              # Login & profile endpoints
│   │   ├── barang.ts            # CRUD barang
│   │   ├── supplier.ts          # CRUD supplier
│   │   ├── transaksi-masuk.ts  # Transaksi barang masuk
│   │   ├── transaksi-keluar.ts # Transaksi barang keluar
│   │   └── dashboard.ts         # Dashboard statistics
│   └── server.ts                # Main server file
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Default Login

- **Username:** `admin`
- **Password:** `admin123`

## 📡 API Endpoints (Summary)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login & get token |
| GET | `/api/auth/profile` | Get user profile |
| GET | `/api/barang` | Get all barang |
| POST | `/api/barang` | Create barang |
| PUT | `/api/barang/:id` | Update barang |
| DELETE | `/api/barang/:id` | Delete barang |
| GET | `/api/supplier` | Get all supplier |
| POST | `/api/supplier` | Create supplier |
| PUT | `/api/supplier/:id` | Update supplier |
| DELETE | `/api/supplier/:id` | Delete supplier |
| GET | `/api/transaksi-masuk` | Get all transaksi masuk |
| POST | `/api/transaksi-masuk` | Create transaksi masuk |
| DELETE | `/api/transaksi-masuk/:id` | Delete transaksi masuk |
| GET | `/api/transaksi-keluar` | Get all transaksi keluar |
| POST | `/api/transaksi-keluar` | Create transaksi keluar |
| DELETE | `/api/transaksi-keluar/:id` | Delete transaksi keluar |
| GET | `/api/dashboard/statistics` | Get dashboard stats |

Lihat **README.md** untuk dokumentasi lengkap setiap endpoint.

## ⚠️ Troubleshooting

### Port sudah digunakan
Jika port 5000 sudah dipakai, edit file `.env`:
```env
PORT=5001
```

### Database error
Hapus file `database.sqlite` dan jalankan ulang:
```bash
npm run init-db
```

### Permission error Windows
Jalankan terminal sebagai Administrator jika ada error permission.
