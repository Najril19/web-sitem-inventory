# 🏪 Sistem Inventori El-Hibbani

Sistem manajemen inventori toko menggunakan **Next.js 15** (frontend) dan **Express.js + SQLite** (backend).

## 📁 Struktur Project

```
APK INVENTORY/
├── backend/                    # Backend API (Express + TypeScript + SQLite)
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── database/          # Database schema & initialization
│   │   ├── middleware/        # JWT authentication
│   │   └── server.ts          # Main server
│   ├── package.json
│   ├── README.md              # Backend documentation
│   └── SETUP.md               # Backend setup guide
│
├── src/                       # Frontend (Next.js 15 + TypeScript)
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   │   ├── AppShell.tsx      # Main layout
│   │   ├── Login.tsx         # Login (✅ Integrated)
│   │   ├── Dashboard.tsx     # Dashboard (✅ Integrated)
│   │   ├── DataBarang.tsx    # CRUD Barang
│   │   ├── DataSupplier.tsx  # CRUD Supplier
│   │   ├── TransaksiMasuk.tsx
│   │   ├── TransaksiKeluar.tsx
│   │   └── Laporan.tsx
│   ├── lib/
│   │   ├── api.ts            # API client (✅ All endpoints ready)
│   │   └── auth.ts           # Auth helpers
│   └── styles/
│
├── .env.local                 # Frontend environment variables
├── package.json               # Frontend dependencies
├── INTEGRASI_FRONTEND_BACKEND.md  # Integration guide
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Setup & Jalankan Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Inisialisasi database & seed data
npm run init-db

# Jalankan development server
npm run dev
```

Backend akan jalan di **http://localhost:5000**

**Default Login:**
- Username: `admin`
- Password: `admin123`

### 2. Jalankan Frontend

Buka terminal baru:

```bash
# Kembali ke root project
cd ..

# Install dependencies (jika belum)
npm install

# Jalankan development server
npm run dev
```

Frontend akan jalan di **http://localhost:3000**

### 3. Test Aplikasi

1. Buka browser: `http://localhost:3000`
2. Login dengan username `admin` dan password `admin123`
3. Dashboard akan menampilkan data dari backend
4. Coba tambah/edit/hapus data barang, supplier, atau transaksi

## 🔌 API Endpoints

Backend menyediakan REST API lengkap:

### Authentication
- `POST /api/auth/login` - Login & get JWT token
- `GET /api/auth/profile` - Get user profile

### Barang (Inventory Items)
- `GET /api/barang` - List all items
- `POST /api/barang` - Create item
- `PUT /api/barang/:id` - Update item
- `DELETE /api/barang/:id` - Delete item

### Supplier
- `GET /api/supplier` - List all suppliers
- `POST /api/supplier` - Create supplier
- `PUT /api/supplier/:id` - Update supplier
- `DELETE /api/supplier/:id` - Delete supplier

### Transaksi Masuk (Incoming Transactions)
- `GET /api/transaksi-masuk` - List transactions
- `POST /api/transaksi-masuk` - Create transaction (auto update stock +)
- `DELETE /api/transaksi-masuk/:id` - Delete transaction (restore stock)

### Transaksi Keluar (Outgoing Transactions)
- `GET /api/transaksi-keluar` - List transactions
- `POST /api/transaksi-keluar` - Create transaction (auto update stock -, with validation)
- `DELETE /api/transaksi-keluar/:id` - Delete transaction (restore stock)

### Dashboard
- `GET /api/dashboard/statistics` - Get dashboard statistics

Dokumentasi lengkap: `backend/README.md`

## ✅ Fitur Yang Sudah Terintegrasi

- ✅ **Login** - Autentikasi dengan JWT token
- ✅ **Dashboard** - Real-time statistics dari database
- ✅ **Logout** - Clear session & token
- ✅ **API Client** - Ready untuk semua endpoint
- ⏳ **CRUD Barang** - Perlu update komponen (guide tersedia)
- ⏳ **CRUD Supplier** - Perlu update komponen (guide tersedia)
- ⏳ **Transaksi** - Perlu update komponen (guide tersedia)

## 📚 Dokumentasi

- **Backend Setup**: `backend/SETUP.md`
- **Backend API**: `backend/README.md`
- **Integrasi Frontend-Backend**: `INTEGRASI_FRONTEND_BACKEND.md` ⭐
- **Contoh Kode Integrasi**: Lihat `INTEGRASI_FRONTEND_BACKEND.md`

## 🗄️ Database

Database menggunakan **SQLite** (`backend/database.sqlite`).

### Tables:
1. **users** - User authentication
2. **barang** - Inventory items
3. **supplier** - Suppliers
4. **transaksi_masuk** - Incoming transactions
5. **transaksi_keluar** - Outgoing transactions

### Sample Data:
- 1 admin user
- 4 suppliers
- 5 barang/items
- Auto-generated sample transactions

Reset database: Hapus file `database.sqlite` dan jalankan `npm run init-db`

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Recharts** - Charts
- **Shadcn UI** - UI components
- **date-fns** - Date formatting

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **SQLite** - Database (better-sqlite3)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## 🔐 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```env
PORT=5000
JWT_SECRET=el-hibbani-inventory-secret-key-2026
NODE_ENV=development
DATABASE_PATH=./database.sqlite
```

## 📝 Development Notes

1. **Auto Stock Update**: Transaksi masuk/keluar otomatis update stok barang
2. **JWT Token**: Disimpan di localStorage, expired setelah 24 jam
3. **API Client**: Sudah handle authentication header otomatis
4. **Error Handling**: Backend return error message yang bisa ditampilkan

## 🧪 Testing API

Gunakan Postman, Thunder Client, atau cURL:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get barang (dengan token)
curl -X GET http://localhost:5000/api/barang \
  -H "Authorization: Bearer <your-token>"
```

## 🐛 Troubleshooting

### Backend tidak jalan
```bash
cd backend
npm install
npm run init-db
npm run dev
```

### Frontend error "Cannot connect to API"
- Pastikan backend jalan di port 5000
- Cek `.env.local` sudah benar

### Login gagal
- Pastikan backend database sudah diinit
- Default user: `admin` / `admin123`

### Port sudah digunakan
- Backend: Edit `backend/.env`, ubah `PORT=5001`
- Frontend: Jalankan `npm run dev -- -p 3001`

## 📞 Support

Untuk pertanyaan atau issue, silakan check:
1. `INTEGRASI_FRONTEND_BACKEND.md` untuk panduan integrasi
2. `backend/README.md` untuk dokumentasi API lengkap
3. Console browser untuk error log

---

**© 2026 Toko El-Hibbani - Sistem Inventori**
