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
    const { data: supplier, error } = await supabase
      .from('supplier')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !supplier) {
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
    const { nama, kontak, alamat, keterangan } = body;

    const { data: existing } = await supabase
      .from('supplier')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    const { data: updatedSupplier, error } = await supabase
      .from('supplier')
      .update({
        nama: nama,
        kontak: kontak || null,
        alamat: alamat || null,
        keterangan: keterangan || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal update supplier' },
        { status: 500 }
      );
    }

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
      .from('supplier')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Supplier tidak ditemukan' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('supplier')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menghapus supplier' },
        { status: 500 }
      );
    }

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
