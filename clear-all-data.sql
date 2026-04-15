-- Script untuk menghapus semua data (kecuali admin user)
-- Jalankan di Supabase SQL Editor

-- 1. Delete transaksi_masuk (child table)
DELETE FROM transaksi_masuk;

-- 2. Delete transaksi_keluar (child table)
DELETE FROM transaksi_keluar;

-- 3. Delete barang (parent table)
DELETE FROM barang;

-- 4. Delete supplier (parent table)
DELETE FROM supplier;

-- Verification - Check counts
SELECT 'transaksi_masuk' as table_name, COUNT(*) as count FROM transaksi_masuk
UNION ALL
SELECT 'transaksi_keluar' as table_name, COUNT(*) as count FROM transaksi_keluar
UNION ALL
SELECT 'barang' as table_name, COUNT(*) as count FROM barang
UNION ALL
SELECT 'supplier' as table_name, COUNT(*) as count FROM supplier
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users;
