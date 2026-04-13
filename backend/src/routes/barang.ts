import { Router, Response } from 'express';
import { getDatabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all barang
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const barang = db.prepare('SELECT * FROM barang ORDER BY created_at DESC').all();

    res.json({
      success: true,
      data: barang,
    });
  } catch (error) {
    console.error('Get barang error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Get barang by ID
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const barang = db.prepare('SELECT * FROM barang WHERE id = ?').get(id);

    if (!barang) {
      return res.status(404).json({ error: 'Barang tidak ditemukan' });
    }

    res.json({
      success: true,
      data: barang,
    });
  } catch (error) {
    console.error('Get barang by ID error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Create barang
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const {
      kode_barang,
      nama_barang,
      merk,
      kategori,
      stok,
      harga_beli,
      harga_jual,
      satuan,
      keterangan,
    } = req.body;

    if (!kode_barang || !nama_barang) {
      return res.status(400).json({ error: 'Kode barang dan nama barang harus diisi' });
    }

    const db = getDatabase();

    // Check if kode_barang already exists
    const existing = db.prepare('SELECT id FROM barang WHERE kode_barang = ?').get(kode_barang);
    if (existing) {
      return res.status(400).json({ error: 'Kode barang sudah digunakan' });
    }

    const result = db.prepare(`
      INSERT INTO barang (kode_barang, nama_barang, merk, kategori, stok, harga_beli, harga_jual, satuan, keterangan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      kode_barang,
      nama_barang,
      merk || null,
      kategori || null,
      stok || 0,
      harga_beli || 0,
      harga_jual || 0,
      satuan || 'Unit',
      keterangan || null
    );

    const newBarang = db.prepare('SELECT * FROM barang WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: newBarang,
    });
  } catch (error) {
    console.error('Create barang error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Update barang
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      kode_barang,
      nama_barang,
      merk,
      kategori,
      stok,
      harga_beli,
      harga_jual,
      satuan,
      keterangan,
    } = req.body;

    const db = getDatabase();

    // Check if barang exists
    const existing = db.prepare('SELECT id FROM barang WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Barang tidak ditemukan' });
    }

    // Check if kode_barang is taken by another barang
    if (kode_barang) {
      const duplicate = db.prepare('SELECT id FROM barang WHERE kode_barang = ? AND id != ?').get(kode_barang, id);
      if (duplicate) {
        return res.status(400).json({ error: 'Kode barang sudah digunakan' });
      }
    }

    db.prepare(`
      UPDATE barang
      SET kode_barang = COALESCE(?, kode_barang),
          nama_barang = COALESCE(?, nama_barang),
          merk = ?,
          kategori = ?,
          stok = COALESCE(?, stok),
          harga_beli = COALESCE(?, harga_beli),
          harga_jual = COALESCE(?, harga_jual),
          satuan = COALESCE(?, satuan),
          keterangan = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      kode_barang,
      nama_barang,
      merk,
      kategori,
      stok,
      harga_beli,
      harga_jual,
      satuan,
      keterangan,
      id
    );

    const updatedBarang = db.prepare('SELECT * FROM barang WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Barang berhasil diupdate',
      data: updatedBarang,
    });
  } catch (error) {
    console.error('Update barang error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Delete barang
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM barang WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Barang tidak ditemukan' });
    }

    db.prepare('DELETE FROM barang WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Barang berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete barang error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
