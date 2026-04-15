import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Search, Package, RefreshCw, Loader2 } from 'lucide-react';
import { authStorage } from '@/lib/auth';
import { useNotification, NotificationContainer } from '@/components/Notification';

interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  merk: string;
  kategori: string;
  satuan: string;
  stok: number;
  harga_beli: number;
  harga_jual: number;
  keterangan: string;
}

export default function DataBarang() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Barang | null>(null);
  const [formData, setFormData] = useState<Partial<Barang>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notification hook
  const { notifications, removeNotification, showSuccess, showError, showWarning } = useNotification();

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
        setBarang(result.data);
      } else {
        showError('Gagal Memuat Data', result.message || 'Tidak dapat memuat data barang');
      }
    } catch (error) {
      console.error('Error fetching barang:', error);
      showError('Error Koneksi', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const filteredBarang = barang.filter(item =>
    item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.merk && item.merk.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: Barang) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const itemToDelete = barang.find(item => item.id === id);
    
    if (confirm(`Yakin ingin menghapus "${itemToDelete?.nama_barang}"?`)) {
      try {
        const token = authStorage.getToken();
        const response = await fetch(`/api/barang/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          fetchBarang();
          showSuccess('Berhasil Dihapus', `${itemToDelete?.nama_barang} berhasil dihapus dari database`);
        } else {
          showError('Gagal Menghapus', result.message || 'Tidak dapat menghapus data barang');
        }
      } catch (error) {
        console.error('Error deleting barang:', error);
        showError('Error Koneksi', 'Tidak dapat terhubung ke server untuk menghapus data');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.nama_barang?.trim()) {
      showError('Data Tidak Lengkap', 'Nama barang harus diisi');
      return;
    }
    
    if (!formData.kode_barang?.trim()) {
      showError('Data Tidak Lengkap', 'Kode barang harus diisi');
      return;
    }
    
    if (!formData.harga_beli || formData.harga_beli <= 0) {
      showError('Harga Tidak Valid', 'Harga beli harus lebih dari 0');
      return;
    }
    
    if (!formData.harga_jual || formData.harga_jual <= 0) {
      showError('Harga Tidak Valid', 'Harga jual harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = authStorage.getToken();
      const url = editingItem ? `/api/barang/${editingItem.id}` : '/api/barang';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh data barang dengan animasi
        setIsRefreshing(true);
        await fetchBarang();
        
        // Delay untuk animasi refresh
        setTimeout(() => {
          setIsRefreshing(false);
        }, 800);
        
        // Tutup modal
        setShowModal(false);
        
        if (editingItem) {
          showSuccess('Berhasil Diperbarui', `Data ${formData.nama_barang} berhasil diperbarui`);
        } else {
          showSuccess('Berhasil Ditambahkan', `${formData.nama_barang} berhasil ditambahkan ke database`);
        }
      } else {
        if (result.message?.includes('kode_barang')) {
          showError('Kode Barang Sudah Ada', 'Kode barang sudah digunakan, silakan gunakan kode lain');
        } else {
          showError('Gagal Menyimpan', result.message || 'Terjadi kesalahan saat menyimpan data');
        }
      }
    } catch (error) {
      console.error('Error saving barang:', error);
      showError('Error Koneksi', 'Tidak dapat terhubung ke server untuk menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
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
          <h1 className="text-3xl font-bold text-white">Data Barang</h1>
          <p className="text-gray-400 mt-1">Kelola data persediaan barang</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Barang
        </motion.button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 p-4 border border-gray-700"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama, kode, atau merk..."
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white placeholder-gray-400"
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
        className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 border border-gray-700 overflow-hidden w-full"
      >
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Nama Barang</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Satuan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Stok</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Harga</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <AnimatePresence>
                {filteredBarang.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-300">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-white">{item.kode_barang}</td>
                    <td className="px-6 py-4 text-gray-300">{item.nama_barang} {item.merk}</td>
                    <td className="px-6 py-4 text-gray-300">{item.satuan}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        item.stok > 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        item.stok > 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {item.stok}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">Rp {item.harga_jual.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl shadow-2xl shadow-black/70 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  <Package className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kode Barang {!editingItem && '*'}</label>
                    <input
                      type="text"
                      value={formData.kode_barang || ''}
                      onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      required={!editingItem}
                      placeholder="Masukkan kode barang"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nama Barang {!editingItem && '*'}</label>
                    <input
                      type="text"
                      value={formData.nama_barang || ''}
                      onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      required={!editingItem}
                      placeholder="Masukkan nama barang"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Merk</label>
                    <input
                      type="text"
                      value={formData.merk || ''}
                      onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      placeholder="Masukkan merk barang"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Satuan</label>
                    <select
                      value={formData.satuan || ''}
                      onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                    >
                      <option value="">Pilih Satuan</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Lusin">Lusin</option>
                      <option value="Pack">Pack</option>
                      <option value="Unit">Unit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stok</label>
                    <input
                      type="number"
                      value={formData.stok || ''}
                      onChange={(e) => setFormData({ ...formData, stok: e.target.value ? parseInt(e.target.value) : 0 })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Harga Jual</label>
                    <input
                      type="number"
                      value={formData.harga_jual || ''}
                      onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value ? parseInt(e.target.value) : 0 })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      min="0"
                      placeholder="0"
                    />
                  </div>
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
                      editingItem ? 'Simpan Perubahan' : 'Tambah Barang'
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
