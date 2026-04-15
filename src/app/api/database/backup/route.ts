import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { authenticate } from '@/lib/auth';

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

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Hanya admin yang dapat melakukan backup' },
        { status: 403 }
      );
    }

    // Backup all tables
    const [users, supplier, barang, transaksiMasuk, transaksiKeluar] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('supplier').select('*'),
      supabase.from('barang').select('*'),
      supabase.from('transaksi_masuk').select('*'),
      supabase.from('transaksi_keluar').select('*'),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      users: users.data || [],
      supplier: supplier.data || [],
      barang: barang.data || [],
      transaksi_masuk: transaksiMasuk.data || [],
      transaksi_keluar: transaksiKeluar.data || [],
    };

    return NextResponse.json({
      success: true,
      message: 'Backup database berhasil',
      data: backup,
    });
  } catch (error) {
    console.error('Backup database error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
