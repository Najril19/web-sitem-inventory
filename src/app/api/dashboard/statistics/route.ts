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
    const currentMonth = new Date().toISOString().slice(0, 7);

    const totalBarang = db.prepare('SELECT COUNT(*) as count FROM barang').get() as any;
    const totalStok = db.prepare('SELECT SUM(stok) as total FROM barang').get() as any;
    const barangMasuk = db.prepare(`
      SELECT SUM(jumlah) as total
      FROM transaksi_masuk
      WHERE strftime('%Y-%m', tanggal) = ?
    `).get(currentMonth) as any;
    const barangKeluar = db.prepare(`
      SELECT SUM(jumlah) as total
      FROM transaksi_keluar
      WHERE strftime('%Y-%m', tanggal) = ?
    `).get(currentMonth) as any;
    const topProducts = db.prepare(`
      SELECT id, kode_barang, nama_barang, merk, stok
      FROM barang
      ORDER BY stok DESC
      LIMIT 5
    `).all();
    const monthlyStats = db.prepare(`
      WITH months AS (
        SELECT strftime('%Y-%m', date('now', '-5 months')) as month
        UNION SELECT strftime('%Y-%m', date('now', '-4 months'))
        UNION SELECT strftime('%Y-%m', date('now', '-3 months'))
        UNION SELECT strftime('%Y-%m', date('now', '-2 months'))
        UNION SELECT strftime('%Y-%m', date('now', '-1 month'))
        UNION SELECT strftime('%Y-%m', date('now'))
      )
      SELECT 
        m.month,
        COALESCE(SUM(tm.jumlah), 0) as masuk,
        COALESCE(SUM(tk.jumlah), 0) as keluar
      FROM months m
      LEFT JOIN transaksi_masuk tm ON strftime('%Y-%m', tm.tanggal) = m.month
      LEFT JOIN transaksi_keluar tk ON strftime('%Y-%m', tk.tanggal) = m.month
      GROUP BY m.month
      ORDER BY m.month
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_barang: totalBarang.count,
          total_stok: totalStok.total || 0,
          barang_masuk_bulan_ini: barangMasuk.total || 0,
          barang_keluar_bulan_ini: barangKeluar.total || 0,
        },
        top_products: topProducts,
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
