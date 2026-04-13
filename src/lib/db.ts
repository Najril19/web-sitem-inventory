import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          username: string;
          password: string;
          full_name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
      };
      supplier: {
        Row: {
          id: number;
          nama: string;
          kontak: string;
          alamat: string;
          keterangan: string;
          created_at: string;
          updated_at: string;
        };
      };
      barang: {
        Row: {
          id: number;
          kode_barang: string;
          nama_barang: string;
          merk: string;
          kategori: string;
          stok: number;
          harga_beli: number;
          harga_jual: number;
          satuan: string;
          keterangan: string;
          created_at: string;
          updated_at: string;
        };
      };
      transaksi_masuk: {
        Row: {
          id: number;
          tanggal: string;
          barang_id: number;
          supplier_id: number;
          jumlah: number;
          harga_satuan: number;
          total_harga: number;
          keterangan: string;
          created_by: number;
          created_at: string;
          updated_at: string;
        };
      };
      transaksi_keluar: {
        Row: {
          id: number;
          tanggal: string;
          barang_id: number;
          jumlah: number;
          tujuan: string;
          keterangan: string;
          created_by: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
