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

    const { data: supplier, error } = await supabase
      .from('supplier')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengambil data supplier' },
        { status: 500 }
      );
    }

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

    const { data: newSupplier, error } = await supabase
      .from('supplier')
      .insert({
        nama,
        kontak: kontak || null,
        alamat: alamat || null,
        keterangan: keterangan || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menambah supplier' },
        { status: 500 }
      );
    }

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
