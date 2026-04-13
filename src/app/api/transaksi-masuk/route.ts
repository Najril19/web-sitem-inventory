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

    return NextResponse.json({
      success: true,
      data: transaksi,
    });
  } catch (error) {
    console.error('Get transaksi masuk error:', error);
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
    const { tanggal, barang_id, supplier_id, jumlah, harga_satuan, keterangan } = body;

    if (!tanggal || !barang_id || !supplier_id || !jumlah) {
      return NextResponse.json(
        { error: 'Tanggal, barang, supplier, dan jumlah harus diisi' },
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

    const supplier = db.prepare('SELECT id FROM supplier WHERE id = ?').get(supplier_id);
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    const hargaSatuanValue = harga_satuan || 0;
    const totalHarga = jumlah * hargaSatuanValue;

    const result = db.prepare(`
      INSERT INTO transaksi_masuk (tanggal, barang_id, supplier_id, jumlah, harga_satuan, total_harga, keterangan, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tanggal, barang_id, supplier_id, jumlah, hargaSatuanValue, totalHarga, keterangan || null, user.id);

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

    return NextResponse.json({
      success: true,
      message: 'Transaksi masuk berhasil ditambahkan',
      data: newTransaksi,
    }, { status: 201 });
  } catch (error) {
    console.error('Create transaksi masuk error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
