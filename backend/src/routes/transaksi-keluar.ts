import { Router, Response } from 'express';
import { getDatabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all transaksi keluar with join
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const transaksi = db.prepare(`
      SELECT 
        tk.id,
        tk.tanggal,
        tk.jumlah,
        tk.tujuan,
        tk.keterangan,
        tk.created_at,
        b.id as barang_id,
        b.nama_barang,
        b.kode_barang
      FROM transaksi_keluar tk
      JOIN barang b ON tk.barang_id = b.id
      ORDER BY tk.tanggal DESC, tk.created_at DESC
    `).all();

    res.json({
      success: true,
      data: transaksi,
    });
  } catch (error) {
    console.error('Get transaksi keluar error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Get transaksi keluar by ID
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const transaksi = db.prepare(`
      SELECT 
        tk.*,
        b.nama_barang,
        b.kode_barang
      FROM transaksi_keluar tk
      JOIN barang b ON tk.barang_id = b.id
      WHERE tk.id = ?
    `).get(id);

    if (!transaksi) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    res.json({
      success: true,
      data: transaksi,
    });
  } catch (error) {
    console.error('Get transaksi keluar by ID error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Create transaksi keluar
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { tanggal, barang_id, jumlah, tujuan, keterangan } = req.body;

    if (!tanggal || !barang_id || !jumlah || !tujuan) {
      return res.status(400).json({ error: 'Tanggal, barang, jumlah, dan tujuan harus diisi' });
    }

    const db = getDatabase();

    // Check if barang exists
    const barang = db.prepare('SELECT id, stok FROM barang WHERE id = ?').get(barang_id) as any;
    if (!barang) {
      return res.status(404).json({ error: 'Barang tidak ditemukan' });
    }

    // Check if stock is sufficient
    if (barang.stok < jumlah) {
      return res.status(400).json({ error: `Stok tidak mencukupi. Stok tersedia: ${barang.stok}` });
    }

    // Insert transaksi
    const result = db.prepare(`
      INSERT INTO transaksi_keluar (tanggal, barang_id, jumlah, tujuan, keterangan, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tanggal, barang_id, jumlah, tujuan, keterangan || null, req.user!.id);

    // Update stok barang
    const newStok = barang.stok - jumlah;
    db.prepare('UPDATE barang SET stok = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStok, barang_id);

    const newTransaksi = db.prepare(`
      SELECT 
        tk.*,
        b.nama_barang
      FROM transaksi_keluar tk
      JOIN barang b ON tk.barang_id = b.id
      WHERE tk.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Transaksi keluar berhasil ditambahkan',
      data: newTransaksi,
    });
  } catch (error) {
    console.error('Create transaksi keluar error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Delete transaksi keluar
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const transaksi = db.prepare('SELECT barang_id, jumlah FROM transaksi_keluar WHERE id = ?').get(id) as any;
    if (!transaksi) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    // Restore stok barang
    const barang = db.prepare('SELECT stok FROM barang WHERE id = ?').get(transaksi.barang_id) as any;
    const newStok = barang.stok + transaksi.jumlah;
    db.prepare('UPDATE barang SET stok = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStok, transaksi.barang_id);

    db.prepare('DELETE FROM transaksi_keluar WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Transaksi keluar berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete transaksi keluar error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Get summary statistics
router.get('/statistics/summary', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const result = db.prepare(`
      SELECT 
        COUNT(*) as total_transaksi,
        SUM(jumlah) as total_unit
      FROM transaksi_keluar
      WHERE strftime('%Y-%m', tanggal) = ?
    `).get(currentMonth);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get transaksi keluar statistics error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
