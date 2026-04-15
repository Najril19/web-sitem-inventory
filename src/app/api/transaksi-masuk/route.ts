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
      .from('transaksi_masuk')
      .select(`
        id,
        tanggal,
        jumlah,
        harga_satuan,
        total_harga,
        keterangan,
        created_at,
        barang:barang_id(id, nama_barang, kode_barang, merk),
        supplier:supplier_id(id, nama)
      `)
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data transaksi masuk' },
        { status: 500 }
      );
    }

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

    // Validasi supplier hanya jika supplier_id diberikan
    if (supplier_id) {
      const { data: supplier, error: supplierError } = await supabase
        .from('supplier')
        .select('id')
        .eq('id', supplier_id)
        .single();

      if (supplierError || !supplier) {
        return NextResponse.json(
          { error: 'Supplier tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    const hargaSatuanValue = harga_satuan || 0;
    const totalHarga = jumlah * hargaSatuanValue;

    const { data: newTransaksi, error: insertError } = await supabase
      .from('transaksi_masuk')
      .insert({
        tanggal: tanggal || new Date().toISOString().split('T')[0],
        barang_id,
        supplier_id: supplier_id || null,
        jumlah,
        harga_satuan: hargaSatuanValue,
        total_harga: totalHarga,
        keterangan: keterangan || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Gagal menambah transaksi masuk' },
        { status: 500 }
      );
    }

    const newStok = barang.stok + jumlah;
    await supabase
      .from('barang')
      .update({ stok: newStok, updated_at: new Date().toISOString() })
      .eq('id', barang_id);

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
