import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, TrendingUp, Calendar, Package, Truck, ArrowDownCircle, CheckCircle, Clock, PackagePlus, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { InventoryDatePicker } from '@/components/InventoryDatePicker';
import { authStorage } from '@/lib/auth';
import { useNotification, NotificationContainer } from '@/components/Notification';

interface TransaksiMasuk {
  id: number;
  tanggal: string;
  barang_id: number;
  barang?: { nama_barang: string; merk?: string };
  supplier_id: number;
  supplier?: { nama: string };
  jumlah: number;
  keterangan: string;
}

export default function TransaksiMasuk() {
  const [transaksi, setTransaksi] = useState<TransaksiMasuk[]>([]);
  const [barangList, setBarangList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<TransaksiMasuk>>({
    tanggal: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notification hook
  const { notifications, removeNotification, showSuccess, showError, showWarning } = useNotification();

  const fetchTransaksi = async () => {
    try {
      const token = authStorage.getToken();
      const response = await fetch('/api/transaksi-masuk', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTransaksi(result.data);
      } else {
        showError('Gagal Memuat Data', result.message || 'Tidak dapat memuat data transaksi masuk');
      }
    } catch (error) {
      console.error('Error fetching transaksi masuk:', error);
      showError('Error Koneksi', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarang = async () => {
    try {
      const token = authStorage.getToken();
      const response = await fetch('/api/barang', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setBarangList(result.data);
      } else {
        showError('Gagal Memuat Barang', result.message || 'Tidak dapat memuat daftar barang');
      }
    } catch (error) {
      console.error('Error fetching barang:', error);
      showError('Error Koneksi', 'Tidak dapat memuat daftar barang dari server');
    }
  };

  useEffect(() => {
    fetchTransaksi();
    fetchBarang();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form - hanya barang dan jumlah yang wajib
    if (!formData.barang_id) {
      showError('Data Tidak Lengkap', 'Silakan pilih barang terlebih dahulu');
      return;
    }
    
    if (!formData.jumlah || formData.jumlah <= 0) {
      showError('Jumlah Tidak Valid', 'Jumlah barang harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = authStorage.getToken();
      
      const response = await fetch('/api/transaksi-masuk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh data transaksi dengan animasi
        setIsRefreshing(true);
        await fetchTransaksi();
        
        // Delay untuk animasi refresh
        setTimeout(() => {
          setIsRefreshing(false);
        }, 800);
        
        // Tutup modal
        setShowModal(false);
        setFormData({ tanggal: new Date().toISOString().split('T')[0] });
        
        const selectedBarang = barangList.find(b => b.id === formData.barang_id);
        const supplierText = formData.supplier_id ? 
          ` dari ${['', 'PT Rabbani Textile', 'CV Al-Madinah Fashion', 'UD Dannis Collection', 'Toko Ethica Pusat'][formData.supplier_id]}` : 
          '';
        
        showSuccess(
          'Transaksi Berhasil!', 
          `${formData.jumlah} unit ${selectedBarang?.nama_barang || 'barang'}${supplierText} berhasil ditambahkan ke stok`
        );
      } else {
        // Handle specific error messages
        if (result.message?.includes('stok')) {
          showError('Stok Tidak Mencukupi', result.message);
        } else if (result.message?.includes('barang')) {
          showError('Barang Tidak Ditemukan', result.message);
        } else if (result.message?.includes('supplier')) {
          showError('Supplier Tidak Valid', result.message);
        } else {
          showError('Gagal Menyimpan', result.message || 'Terjadi kesalahan saat menyimpan transaksi');
        }
      }
    } catch (error) {
      console.error('Error saving transaksi masuk:', error);
      showError('Error Koneksi', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransaksi = transaksi.filter(item =>
    item.barang?.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransaksi = filteredTransaksi.slice(startIndex, endIndex);

  const totalMasuk = transaksi.reduce((sum, t) => sum + t.jumlah, 0);

  return (
    <div className="space-y-6">
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Transaksi Barang Masuk</h1>
          <p className="text-gray-400 mt-1">Catat barang yang masuk ke toko</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Transaksi
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 p-6 text-white"
      >
        <div className="flex items-center gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/15">
            <PackagePlus className="size-9 text-emerald-600" strokeWidth={2.25} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/95 sm:text-base">Total Barang Masuk Bulan Ini</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{totalMasuk} Unit</h2>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 border border-gray-700 p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama barang, supplier, atau keterangan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isRefreshing ? [1, 1.02, 1] : 1,
          rotateY: isRefreshing ? [0, 5, 0] : 0
        }}
        transition={{ 
          delay: 0.2,
          scale: { duration: 0.8, ease: "easeInOut" },
          rotateY: { duration: 0.8, ease: "easeInOut" }
        }}
        className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 border border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                    No
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Tanggal
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    Nama Barang
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Jumlah
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    Supplier
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Keterangan
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <AnimatePresence>
                {paginatedTransaksi.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-emerald-500/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                          <span className="text-xs text-emerald-400 font-medium">{startIndex + index + 1}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                          <Package className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="font-medium text-white">{item.barang?.nama_barang ? `${item.barang.nama_barang} (${item.barang.merk || 'Unknown'})` : 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                        <TrendingUp className="w-3 h-3" />
                        +{item.jumlah}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{item.supplier?.nama || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-300">{item.keterangan || '-'}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Always show */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredTransaksi.length)} dari {filteredTransaksi.length} data
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.max(1, totalPages)) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg border ${
                      currentPage === pageNum
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(Math.max(1, totalPages), prev + 1))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl shadow-2xl shadow-black/70 p-8 max-w-2xl w-full border border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Tambah Transaksi Barang Masuk</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Tanggal
                    </label>
                    <InventoryDatePicker
                      value={formData.tanggal || ''}
                      onChange={(v) => setFormData({ ...formData, tanggal: v })}
                      accent="emerald"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Package className="w-4 h-4 inline mr-1" />
                      Nama Barang
                    </label>
                    <select
                      value={formData.barang_id || ''}
                      onChange={(e) => setFormData({ ...formData, barang_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                    >
                      <option value="">Pilih Barang</option>
                      {barangList.map((barang) => (
                        <option key={barang.id} value={barang.id}>
                          {barang.nama_barang} {barang.merk}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah</label>
                    <input
                      type="number"
                      value={formData.jumlah || ''}
                      onChange={(e) => setFormData({ ...formData, jumlah: e.target.value ? parseInt(e.target.value) : 0 })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      placeholder="0"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Truck className="w-4 h-4 inline mr-1" />
                      Supplier
                    </label>
                    <select
                      value={formData.supplier_id || ''}
                      onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                    >
                      <option value="">Pilih Supplier</option>
                      <option value="1">PT Rabbani Textile</option>
                      <option value="2">CV Al-Madinah Fashion</option>
                      <option value="3">UD Dannis Collection</option>
                      <option value="4">Toko Ethica Pusat</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Keterangan</label>
                  <textarea
                    value={formData.keterangan || ''}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                    rows={3}
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3 rounded-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isSubmitting 
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30 hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Transaksi'
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                    className={`flex-1 py-3 rounded-lg font-medium border transition-colors ${
                      isSubmitting
                        ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    Batal
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
