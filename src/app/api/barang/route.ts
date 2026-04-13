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

    const { data: barang, error } = await supabase
      .from('barang')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data barang' },
        { status: 500 }
      );
    }

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

    const { data: existing } = await supabase
      .from('barang')
      .select('id')
      .eq('kode_barang', kode_barang)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Kode barang sudah digunakan' },
        { status: 400 }
      );
    }

    const { data: newBarang, error } = await supabase
      .from('barang')
      .insert({
        kode_barang,
        nama_barang,
        merk: merk || null,
        kategori: kategori || null,
        stok: stok || 0,
        harga_beli: harga_beli || 0,
        harga_jual: harga_jual || 0,
        satuan: satuan || 'Unit',
        keterangan: keterangan || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menambah barang' },
        { status: 500 }
      );
    }

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
