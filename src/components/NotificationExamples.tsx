// Contoh penggunaan sistem notifikasi
import { useNotification } from '@/components/Notification';

export const NotificationExamples = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const examples = {
    // Notifikasi sukses
    success: () => {
      showSuccess('Transaksi Berhasil!', 'Barang berhasil ditambahkan ke stok');
      showSuccess('Data Tersimpan', 'Perubahan berhasil disimpan ke database', 3000);
    },

    // Notifikasi error dengan berbagai skenario
    errors: () => {
      showError('Stok Tidak Mencukupi', 'Stok Koko Rosyid N9 hanya tersisa 5 unit, tidak dapat mengeluarkan 10 unit');
      showError('Gagal Menyimpan', 'Kode barang sudah digunakan, silakan gunakan kode lain');
      showError('Error Koneksi', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      showError('Data Tidak Lengkap', 'Silakan pilih barang terlebih dahulu');
    },

    // Notifikasi warning
    warnings: () => {
      showWarning('Stok Menipis', 'Stok Koko Rosyid N9 tinggal 3 unit, segera lakukan restok');
      showWarning('Data Akan Dihapus', 'Tindakan ini tidak dapat dibatalkan');
    },

    // Notifikasi info
    info: () => {
      showInfo('Sistem Maintenance', 'Sistem akan maintenance pada pukul 02:00 WIB');
      showInfo('Fitur Baru', 'Fitur laporan PDF telah tersedia di menu Laporan');
    }
  };

  return examples;
};

// Contoh notifikasi untuk berbagai skenario bisnis
export const BusinessNotifications = {
  // Transaksi Masuk
  transaksiMasuk: {
    success: (jumlah: number, namaBarang: string) => 
      `${jumlah} unit ${namaBarang} berhasil ditambahkan ke stok`,
    
    errorStok: (namaBarang: string) => 
      `Gagal menambah stok ${namaBarang}. Periksa data barang.`,
    
    errorSupplier: () => 
      'Supplier tidak valid atau tidak ditemukan',
  },

  // Transaksi Keluar  
  transaksiKeluar: {
    success: (jumlah: number, namaBarang: string, tujuan: string) =>
      `${jumlah} unit ${namaBarang} berhasil dikeluarkan untuk ${tujuan}`,
    
    errorStok: (namaBarang: string, stokTersedia: number, jumlahDiminta: number) =>
      `Stok ${namaBarang} hanya tersisa ${stokTersedia} unit, tidak dapat mengeluarkan ${jumlahDiminta} unit`,
    
    warningStokRendah: (namaBarang: string, stokTersisa: number) =>
      `Perhatian! Stok ${namaBarang} tinggal ${stokTersisa} unit setelah transaksi ini`,
  },

  // Data Barang
  dataBarang: {
    success: (namaBarang: string, isEdit: boolean) =>
      isEdit 
        ? `Data ${namaBarang} berhasil diperbarui`
        : `${namaBarang} berhasil ditambahkan ke database`,
    
    errorKodeDuplikat: () =>
      'Kode barang sudah digunakan, silakan gunakan kode lain',
    
    errorValidasi: (field: string) =>
      `${field} harus diisi dengan benar`,
    
    successDelete: (namaBarang: string) =>
      `${namaBarang} berhasil dihapus dari database`,
  },

  // Sistem
  sistem: {
    errorKoneksi: () =>
      'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    
    errorAuth: () =>
      'Sesi Anda telah berakhir. Silakan login kembali.',
    
    maintenance: () =>
      'Sistem sedang dalam maintenance. Coba lagi dalam beberapa menit.',
    
    backupSuccess: () =>
      'Backup database berhasil dibuat',
  }
};