import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
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

    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const startOfMonth = `${currentMonthStr}-01`;

    // 1. Total Barang
    const { count: totalBarangCount } = await supabase
      .from('barang')
      .select('*', { count: 'exact', head: true });

    // 2. Total Stok
    const { data: barangData } = await supabase.from('barang').select('stok');
    const totalStok = barangData?.reduce((acc, curr) => acc + (curr.stok || 0), 0) || 0;

    // 3. Barang Masuk (Bulan Ini)
    const { data: masukData } = await supabase
      .from('transaksi_masuk')
      .select('jumlah')
      .gte('tanggal', startOfMonth);
    const barangMasukBulanIni = masukData?.reduce((acc, curr) => acc + (curr.jumlah || 0), 0) || 0;

    // 4. Barang Keluar (Bulan Ini)
    const { data: keluarData } = await supabase
      .from('transaksi_keluar')
      .select('jumlah')
      .gte('tanggal', startOfMonth);
    const barangKeluarBulanIni = keluarData?.reduce((acc, curr) => acc + (curr.jumlah || 0), 0) || 0;

    // 5. Top Products
    const { data: topProducts } = await supabase
      .from('barang')
      .select('id, kode_barang, nama_barang, merk, stok')
      .order('stok', { ascending: false })
      .limit(5);

    // 6. Monthly Statistics (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const startDate = sixMonthsAgo.toISOString().split('T')[0];

    const { data: recentMasuk } = await supabase
      .from('transaksi_masuk')
      .select('tanggal, jumlah')
      .gte('tanggal', startDate);
      
    const { data: recentKeluar } = await supabase
      .from('transaksi_keluar')
      .select('tanggal, jumlah')
      .gte('tanggal', startDate);

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7)); // YYYY-MM format
    }

    const monthlyStats = months.map(month => {
      const masuk = recentMasuk?.filter(t => t.tanggal.startsWith(month)).reduce((sum, t) => sum + (t.jumlah || 0), 0) || 0;
      const keluar = recentKeluar?.filter(t => t.tanggal.startsWith(month)).reduce((sum, t) => sum + (t.jumlah || 0), 0) || 0;
      return { month, masuk, keluar };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_barang: totalBarangCount || 0,
          total_stok: totalStok,
          barang_masuk_bulan_ini: barangMasukBulanIni,
          barang_keluar_bulan_ini: barangKeluarBulanIni,
        },
        top_products: topProducts || [],
        monthly_statistics: monthlyStats,
      },
    });
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
