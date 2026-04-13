import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

export function initializeDatabase(dbPath: string) {
  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Table: users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table: supplier
  db.exec(`
    CREATE TABLE IF NOT EXISTS supplier (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      kontak TEXT,
      alamat TEXT,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table: barang
  db.exec(`
    CREATE TABLE IF NOT EXISTS barang (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode_barang TEXT UNIQUE NOT NULL,
      nama_barang TEXT NOT NULL,
      merk TEXT,
      kategori TEXT,
      stok INTEGER DEFAULT 0,
      harga_beli INTEGER DEFAULT 0,
      harga_jual INTEGER DEFAULT 0,
      satuan TEXT DEFAULT 'Unit',
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table: transaksi_masuk
  db.exec(`
    CREATE TABLE IF NOT EXISTS transaksi_masuk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal DATE NOT NULL,
      barang_id INTEGER NOT NULL,
      supplier_id INTEGER NOT NULL,
      jumlah INTEGER NOT NULL,
      harga_satuan INTEGER DEFAULT 0,
      total_harga INTEGER DEFAULT 0,
      keterangan TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE,
      FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Table: transaksi_keluar
  db.exec(`
    CREATE TABLE IF NOT EXISTS transaksi_keluar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal DATE NOT NULL,
      barang_id INTEGER NOT NULL,
      jumlah INTEGER NOT NULL,
      tujuan TEXT NOT NULL,
      keterangan TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Insert default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const checkUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  
  if (!checkUser) {
    db.prepare(`
      INSERT INTO users (username, password, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hashedPassword, 'Administrator', 'admin');
    console.log('✓ Default admin user created (username: admin, password: admin123)');
  }

  // Insert sample suppliers
  const supplierCount = db.prepare('SELECT COUNT(*) as count FROM supplier').get() as { count: number };
  if (supplierCount.count === 0) {
    const suppliers = [
      ['PT Rabbani Textile', '021-12345678', 'Jakarta Selatan', 'Supplier utama koko Rabbani'],
      ['CV Al-Madinah Fashion', '022-87654321', 'Bandung', 'Supplier koko Al-Madinah'],
      ['UD Dannis Collection', '031-11223344', 'Surabaya', 'Supplier koko Dannis'],
      ['Toko Ethica Pusat', '024-55667788', 'Semarang', 'Supplier koko Ethica'],
    ];
    
    const insertSupplier = db.prepare('INSERT INTO supplier (nama, kontak, alamat, keterangan) VALUES (?, ?, ?, ?)');
    suppliers.forEach(s => insertSupplier.run(...s));
    console.log(`✓ Inserted ${suppliers.length} sample suppliers`);
  }

  // Insert sample barang
  const barangCount = db.prepare('SELECT COUNT(*) as count FROM barang').get() as { count: number };
  if (barangCount.count === 0) {
    const barangs = [
      ['BRG001', 'Koko Rabbani Premium', 'Rabbani', 'Pakaian Muslim', 0, 200000, 250000, 'Pcs', 'Koko premium quality'],
      ['BRG002', 'Koko Al-Madinah Classic', 'Al-Madinah', 'Pakaian Muslim', 0, 180000, 220000, 'Pcs', 'Desain klasik elegan'],
      ['BRG003', 'Koko Dannis Executive', 'Dannis', 'Pakaian Muslim', 0, 220000, 280000, 'Pcs', 'Executive style'],
      ['BRG004', 'Koko Ethica Modern', 'Ethica', 'Pakaian Muslim', 0, 190000, 235000, 'Pcs', 'Modern contemporary'],
      ['BRG005', 'Koko Shafira Elegant', 'Shafira', 'Pakaian Muslim', 0, 210000, 265000, 'Pcs', 'Elegant design'],
    ];
    
    const insertBarang = db.prepare(`
      INSERT INTO barang (kode_barang, nama_barang, merk, kategori, stok, harga_beli, harga_jual, satuan, keterangan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    barangs.forEach(b => insertBarang.run(...b));
    console.log(`✓ Inserted ${barangs.length} sample barang`);
  }

  // One-time: kosongkan transaksi (masuk/keluar & data laporan); stok barang di-nolkan; supplier tidak diubah
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY NOT NULL
    )
  `);
  const migrationName = 'reset_tx_zero_stok_2026_04';
  const already = db.prepare('SELECT 1 FROM schema_migrations WHERE name = ?').get(migrationName);
  if (!already) {
    db.prepare('DELETE FROM transaksi_masuk').run();
    db.prepare('DELETE FROM transaksi_keluar').run();
    db.prepare('UPDATE barang SET stok = 0, updated_at = CURRENT_TIMESTAMP').run();
    db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(migrationName);
    console.log('✓ Transaksi masuk/keluar dikosongkan; stok semua barang = 0 (supplier tetap)');
  }

  console.log('✓ Database initialized successfully');
  return db;
}
