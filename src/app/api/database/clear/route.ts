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
        { error: 'Hanya admin yang dapat melakukan clear data' },
        { status: 403 }
      );
    }

    const { backup } = await request.json();

    // Step 1: Create backup first if requested
    let backupData = null;
    if (backup) {
      const [users, supplier, barang, transaksiMasuk, transaksiKeluar] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('supplier').select('*'),
        supabase.from('barang').select('*'),
        supabase.from('transaksi_masuk').select('*'),
        supabase.from('transaksi_keluar').select('*'),
      ]);

      backupData = {
        timestamp: new Date().toISOString(),
        users: users.data || [],
        supplier: supplier.data || [],
        barang: barang.data || [],
        transaksi_masuk: transaksiMasuk.data || [],
        transaksi_keluar: transaksiKeluar.data || [],
      };
    }

    // Step 2: Get counts before deletion
    const [
      { count: tmCountBefore },
      { count: tkCountBefore },
      { count: barangCountBefore },
      { count: supplierCountBefore },
    ] = await Promise.all([
      supabase.from('transaksi_masuk').select('*', { count: 'exact', head: true }),
      supabase.from('transaksi_keluar').select('*', { count: 'exact', head: true }),
      supabase.from('barang').select('*', { count: 'exact', head: true }),
      supabase.from('supplier').select('*', { count: 'exact', head: true }),
    ]);

    // Step 3: Delete in cascade order (child tables first)
    const results = {
      transaksi_masuk: { before: tmCountBefore || 0, deleted: 0, error: null as string | null },
      transaksi_keluar: { before: tkCountBefore || 0, deleted: 0, error: null as string | null },
      barang: { before: barangCountBefore || 0, deleted: 0, error: null as string | null },
      supplier: { before: supplierCountBefore || 0, deleted: 0, error: null as string | null },
    };

    // Delete transaksi_masuk
    const { error: tmError } = await supabase.from('transaksi_masuk').delete().neq('id', 0);
    if (tmError) {
      results.transaksi_masuk.error = tmError.message;
    } else {
      results.transaksi_masuk.deleted = tmCountBefore || 0;
    }

    // Delete transaksi_keluar
    const { error: tkError } = await supabase.from('transaksi_keluar').delete().neq('id', 0);
    if (tkError) {
      results.transaksi_keluar.error = tkError.message;
    } else {
      results.transaksi_keluar.deleted = tkCountBefore || 0;
    }

    // Delete barang
    const { error: barangError } = await supabase.from('barang').delete().neq('id', 0);
    if (barangError) {
      results.barang.error = barangError.message;
    } else {
      results.barang.deleted = barangCountBefore || 0;
    }

    // Delete supplier
    const { error: supplierError } = await supabase.from('supplier').delete().neq('id', 0);
    if (supplierError) {
      results.supplier.error = supplierError.message;
    } else {
      results.supplier.deleted = supplierCountBefore || 0;
    }

    // Step 4: Verify deletion
    const [
      { count: tmCountAfter },
      { count: tkCountAfter },
      { count: barangCountAfter },
      { count: supplierCountAfter },
    ] = await Promise.all([
      supabase.from('transaksi_masuk').select('*', { count: 'exact', head: true }),
      supabase.from('transaksi_keluar').select('*', { count: 'exact', head: true }),
      supabase.from('barang').select('*', { count: 'exact', head: true }),
      supabase.from('supplier').select('*', { count: 'exact', head: true }),
    ]);

    const verification = {
      transaksi_masuk: tmCountAfter || 0,
      transaksi_keluar: tkCountAfter || 0,
      barang: barangCountAfter || 0,
      supplier: supplierCountAfter || 0,
    };

    return NextResponse.json({
      success: true,
      message: 'Clear data barang dan tabel terkait berhasil',
      results,
      verification,
      backup: backupData,
    });
  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
