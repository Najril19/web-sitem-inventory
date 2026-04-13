import { Router, Response } from 'express';
import { getDatabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get dashboard statistics
router.get('/statistics', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Total barang
    const totalBarang = db.prepare('SELECT COUNT(*) as count FROM barang').get() as any;

    // Total stok
    const totalStok = db.prepare('SELECT SUM(stok) as total FROM barang').get() as any;

    // Barang masuk bulan ini
    const barangMasuk = db.prepare(`
      SELECT SUM(jumlah) as total
      FROM transaksi_masuk
      WHERE strftime('%Y-%m', tanggal) = ?
    `).get(currentMonth) as any;

    // Barang keluar bulan ini
    const barangKeluar = db.prepare(`
      SELECT SUM(jumlah) as total
      FROM transaksi_keluar
      WHERE strftime('%Y-%m', tanggal) = ?
    `).get(currentMonth) as any;

    // Top 5 barang by stock
    const topProducts = db.prepare(`
      SELECT id, kode_barang, nama_barang, merk, stok
      FROM barang
      ORDER BY stok DESC
      LIMIT 5
    `).all();

    // Monthly statistics (last 6 months)
    const monthlyStats = db.prepare(`
      WITH months AS (
        SELECT strftime('%Y-%m', date('now', '-5 months')) as month
        UNION SELECT strftime('%Y-%m', date('now', '-4 months'))
        UNION SELECT strftime('%Y-%m', date('now', '-3 months'))
        UNION SELECT strftime('%Y-%m', date('now', '-2 months'))
        UNION SELECT strftime('%Y-%m', date('now', '-1 month'))
        UNION SELECT strftime('%Y-%m', date('now'))
      )
      SELECT 
        m.month,
        COALESCE(SUM(tm.jumlah), 0) as masuk,
        COALESCE(SUM(tk.jumlah), 0) as keluar
      FROM months m
      LEFT JOIN transaksi_masuk tm ON strftime('%Y-%m', tm.tanggal) = m.month
      LEFT JOIN transaksi_keluar tk ON strftime('%Y-%m', tk.tanggal) = m.month
      GROUP BY m.month
      ORDER BY m.month
    `).all();

    res.json({
      success: true,
      data: {
        summary: {
          total_barang: totalBarang.count,
          total_stok: totalStok.total || 0,
          barang_masuk_bulan_ini: barangMasuk.total || 0,
          barang_keluar_bulan_ini: barangKeluar.total || 0,
        },
        top_products: topProducts,
        monthly_statistics: monthlyStats,
      },
    });
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
