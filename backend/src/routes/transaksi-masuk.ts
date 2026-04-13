import { Router, Response } from 'express';
import { getDatabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all transaksi masuk with join
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const transaksi = db.prepare(`
      SELECT 
        tm.id,
        tm.tanggal,
        tm.jumlah,
        tm.harga_satuan,
        tm.total_harga,
        tm.keterangan,
        tm.created_at,
        b.id as barang_id,
        b.nama_barang,
        b.kode_barang,
        s.id as supplier_id,
        s.nama as supplier_nama
      FROM transaksi_masuk tm
      JOIN barang b ON tm.barang_id = b.id
      JOIN supplier s ON tm.supplier_id = s.id
      ORDER BY tm.tanggal DESC, tm.created_at DESC
    `).all();

    res.json({
      success: true,
      data: transaksi,
    });
  } catch (error) {
    console.error('Get transaksi masuk error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Get transaksi masuk by ID
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const transaksi = db.prepare(`
      SELECT 
        tm.*,
        b.nama_barang,
        b.kode_barang,
        s.nama as supplier_nama
      FROM transaksi_masuk tm
      JOIN barang b ON tm.barang_id = b.id
      JOIN supplier s ON tm.supplier_id = s.id
      WHERE tm.id = ?
    `).get(id);

    if (!transaksi) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    res.json({
      success: true,
      data: transaksi,
    });
  } catch (error) {
    console.error('Get transaksi masuk by ID error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Create transaksi masuk
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { tanggal, barang_id, supplier_id, jumlah, harga_satuan, keterangan } = req.body;

    if (!tanggal || !barang_id || !supplier_id || !jumlah) {
      return res.status(400).json({ error: 'Tanggal, barang, supplier, dan jumlah harus diisi' });
    }

    const db = getDatabase();

    // Check if barang exists
    const barang = db.prepare('SELECT id, stok FROM barang WHERE id = ?').get(barang_id) as any;
    if (!barang) {
      return res.status(404).json({ error: 'Barang tidak ditemukan' });
    }

    // Check if supplier exists
    const supplier = db.prepare('SELECT id FROM supplier WHERE id = ?').get(supplier_id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier tidak ditemukan' });
    }

    const hargaSatuanValue = harga_satuan || 0;
    const totalHarga = jumlah * hargaSatuanValue;

    // Insert transaksi
    const result = db.prepare(`
      INSERT INTO transaksi_masuk (tanggal, barang_id, supplier_id, jumlah, harga_satuan, total_harga, keterangan, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tanggal, barang_id, supplier_id, jumlah, hargaSatuanValue, totalHarga, keterangan || null, req.user!.id);

    // Update stok barang
    const newStok = barang.stok + jumlah;
    db.prepare('UPDATE barang SET stok = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStok, barang_id);

    const newTransaksi = db.prepare(`
      SELECT 
        tm.*,
        b.nama_barang,
        s.nama as supplier_nama
      FROM transaksi_masuk tm
      JOIN barang b ON tm.barang_id = b.id
      JOIN supplier s ON tm.supplier_id = s.id
      WHERE tm.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Transaksi masuk berhasil ditambahkan',
      data: newTransaksi,
    });
  } catch (error) {
    console.error('Create transaksi masuk error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Delete transaksi masuk
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const transaksi = db.prepare('SELECT barang_id, jumlah FROM transaksi_masuk WHERE id = ?').get(id) as any;
    if (!transaksi) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    // Restore stok barang
    const barang = db.prepare('SELECT stok FROM barang WHERE id = ?').get(transaksi.barang_id) as any;
    const newStok = Math.max(0, barang.stok - transaksi.jumlah);
    db.prepare('UPDATE barang SET stok = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStok, transaksi.barang_id);

    db.prepare('DELETE FROM transaksi_masuk WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Transaksi masuk berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete transaksi masuk error:', error);
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
        SUM(jumlah) as total_unit,
        SUM(total_harga) as total_nilai
      FROM transaksi_masuk
      WHERE strftime('%Y-%m', tanggal) = ?
    `).get(currentMonth);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get transaksi masuk statistics error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
