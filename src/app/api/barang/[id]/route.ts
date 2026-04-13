import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDatabase();
    const barang = db.prepare('SELECT * FROM barang WHERE id = ?').get(id);

    if (!barang) {
      return NextResponse.json(
        { error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: barang,
    });
  } catch (error) {
    console.error('Get barang by ID error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const { id } = await params;
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

    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM barang WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    if (kode_barang) {
      const duplicate = db.prepare('SELECT id FROM barang WHERE kode_barang = ? AND id != ?').get(kode_barang, id);
      if (duplicate) {
        return NextResponse.json(
          { error: 'Kode barang sudah digunakan' },
          { status: 400 }
        );
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

    return NextResponse.json({
      success: true,
      message: 'Barang berhasil diupdate',
      data: updatedBarang,
    });
  } catch (error) {
    console.error('Update barang error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM barang WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM barang WHERE id = ?').run(id);

    return NextResponse.json({
      success: true,
      message: 'Barang berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete barang error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
