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
    const supplier = db.prepare('SELECT * FROM supplier ORDER BY created_at DESC').all();

    return NextResponse.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error('Get supplier error:', error);
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
    const { nama, kontak, alamat, keterangan } = body;

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama supplier harus diisi' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    const result = db.prepare(`
      INSERT INTO supplier (nama, kontak, alamat, keterangan)
      VALUES (?, ?, ?, ?)
    `).run(nama, kontak || null, alamat || null, keterangan || null);

    const newSupplier = db.prepare('SELECT * FROM supplier WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      message: 'Supplier berhasil ditambahkan',
      data: newSupplier,
    }, { status: 201 });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
