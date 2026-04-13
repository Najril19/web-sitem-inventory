import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
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
    const { data: barang, error } = await supabase
      .from('barang')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !barang) {
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

    const { data: existing } = await supabase
      .from('barang')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    if (kode_barang) {
      const { data: duplicate } = await supabase
        .from('barang')
        .select('id')
        .eq('kode_barang', kode_barang)
        .neq('id', id)
        .single();

      if (duplicate) {
        return NextResponse.json(
          { error: 'Kode barang sudah digunakan' },
          { status: 400 }
        );
      }
    }

    const { data: updatedBarang, error } = await supabase
      .from('barang')
      .update({
        kode_barang: kode_barang,
        nama_barang: nama_barang,
        merk: merk || null,
        kategori: kategori || null,
        stok: stok,
        harga_beli: harga_beli,
        harga_jual: harga_jual,
        satuan: satuan,
        keterangan: keterangan || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal update barang' },
        { status: 500 }
      );
    }

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

    const { data: existing } = await supabase
      .from('barang')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Barang tidak ditemukan' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('barang')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menghapus barang' },
        { status: 500 }
      );
    }

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
