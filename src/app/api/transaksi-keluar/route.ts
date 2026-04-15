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

    const { data: transaksi, error } = await supabase
      .from('transaksi_keluar')
      .select(`
        id,
        tanggal,
        jumlah,
        tujuan,
        keterangan,
        created_at,
        barang:barang_id(id, nama_barang, kode_barang, merk)
      `)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data transaksi keluar' },
        { status: 500 }
      );
    }

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

    if (!barang_id || !jumlah) {
      return NextResponse.json(
        { error: 'Barang dan jumlah harus diisi' },
        { status: 400 }
      );
    }

    const { data: barang, error: barangError } = await supabase
      .from('barang')
      .select('id, stok')
      .eq('id', barang_id)
      .single();

    if (barangError || !barang) {
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

    const { data: newTransaksi, error: insertError } = await supabase
      .from('transaksi_keluar')
      .insert({
        tanggal: tanggal || new Date().toISOString().split('T')[0],
        barang_id,
        jumlah,
        tujuan: tujuan || 'Lainnya',
        keterangan: keterangan || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Gagal menambah transaksi keluar' },
        { status: 500 }
      );
    }

    const newStok = barang.stok - jumlah;
    await supabase
      .from('barang')
      .update({ stok: newStok, updated_at: new Date().toISOString() })
      .eq('id', barang_id);

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
