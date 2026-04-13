import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDatabase, closeDatabase } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import barangRoutes from './routes/barang';
import supplierRoutes from './routes/supplier';
import transaksiMasukRoutes from './routes/transaksi-masuk';
import transaksiKeluarRoutes from './routes/transaksi-keluar';
import dashboardRoutes from './routes/dashboard';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
getDatabase();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API Sistem Inventori El-Hibbani',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      barang: '/api/barang',
      supplier: '/api/supplier',
      transaksi_masuk: '/api/transaksi-masuk',
      transaksi_keluar: '/api/transaksi-keluar',
      dashboard: '/api/dashboard',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/transaksi-masuk', transaksiMasukRoutes);
app.use('/api/transaksi-keluar', transaksiKeluarRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Terjadi kesalahan server' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Server Backend El-Hibbani Inventory Running         ║
║                                                           ║
║   Port: ${PORT}                                             ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                ║
║   Database: SQLite (database.sqlite)                     ║
║                                                           ║
║   📍 Base URL: http://localhost:${PORT}                    ║
║   📍 API Docs: http://localhost:${PORT}/                   ║
║                                                           ║
║   Default Login:                                          ║
║   - Username: admin                                       ║
║   - Password: admin123                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
