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
    const barang = db.prepare('SELECT * FROM barang ORDER BY created_at DESC').all();

    return NextResponse.json({
      success: true,
      data: barang,
    });
  } catch (error) {
    console.error('Get barang error:', error);
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
    } = body;

    if (!kode_barang || !nama_barang) {
      return NextResponse.json(
        { error: 'Kode barang dan nama barang harus diisi' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM barang WHERE kode_barang = ?').get(kode_barang);
    if (existing) {
      return NextResponse.json(
        { error: 'Kode barang sudah digunakan' },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: newBarang,
    }, { status: 201 });
  } catch (error) {
    console.error('Create barang error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
