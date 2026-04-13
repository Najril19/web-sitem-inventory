import { Router, Response } from 'express';
import { getDatabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all supplier
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const supplier = db.prepare('SELECT * FROM supplier ORDER BY created_at DESC').all();

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Get supplier by ID
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const supplier = db.prepare('SELECT * FROM supplier WHERE id = ?').get(id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier tidak ditemukan' });
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Create supplier
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { nama, kontak, alamat, keterangan } = req.body;

    if (!nama) {
      return res.status(400).json({ error: 'Nama supplier harus diisi' });
    }

    const db = getDatabase();

    const result = db.prepare(`
      INSERT INTO supplier (nama, kontak, alamat, keterangan)
      VALUES (?, ?, ?, ?)
    `).run(nama, kontak || null, alamat || null, keterangan || null);

    const newSupplier = db.prepare('SELECT * FROM supplier WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Supplier berhasil ditambahkan',
      data: newSupplier,
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Update supplier
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, kontak, alamat, keterangan } = req.body;

    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM supplier WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Supplier tidak ditemukan' });
    }

    db.prepare(`
      UPDATE supplier
      SET nama = COALESCE(?, nama),
          kontak = ?,
          alamat = ?,
          keterangan = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nama, kontak, alamat, keterangan, id);

    const updatedSupplier = db.prepare('SELECT * FROM supplier WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Supplier berhasil diupdate',
      data: updatedSupplier,
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Delete supplier
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM supplier WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Supplier tidak ditemukan' });
    }

    db.prepare('DELETE FROM supplier WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Supplier berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
