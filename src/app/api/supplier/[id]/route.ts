import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const { id } = params;
    const db = getDatabase();
    const supplier = db.prepare('SELECT * FROM supplier WHERE id = ?').get(id);

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { nama, kontak, alamat, keterangan } = body;

    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM supplier WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
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

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil diupdate',
      data: updatedSupplier,
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const { id } = params;
    const db = getDatabase();

    const existing = db.prepare('SELECT id FROM supplier WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM supplier WHERE id = ?').run(id);

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
