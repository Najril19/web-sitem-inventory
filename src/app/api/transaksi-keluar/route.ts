import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      success: true,
      data: transaksi,
    });
  } catch (error) {
    console.error('Get transaksi keluar error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tanggal, barang_id, jumlah, tujuan, keterangan } = body;

    if (!tanggal || !barang_id || !jumlah || !tujuan) {
      return NextResponse.json(
        { error: 'Tanggal, barang, jumlah, dan tujuan harus diisi' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    const barang = db.prepare('SELECT id, stok FROM barang WHERE id = ?').get(barang_id) as any;
    if (!barang) {
      return NextResponse.json(
        { error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    if (barang.stok < jumlah) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi. Stok tersedia: ${barang.stok}` },
        { status: 400 }
      );
    }

    const result = db.prepare(`
      INSERT INTO transaksi_keluar (tanggal, barang_id, jumlah, tujuan, keterangan, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tanggal, barang_id, jumlah, tujuan, keterangan || null, user.id);

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

    return NextResponse.json({
      success: true,
      message: 'Transaksi keluar berhasil ditambahkan',
      data: newTransaksi,
    }, { status: 201 });
  } catch (error) {
    console.error('Create transaksi keluar error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
