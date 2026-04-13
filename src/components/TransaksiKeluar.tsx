import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, TrendingDown, Calendar, Package, User, ArrowUpCircle, CheckCircle, Clock, ShoppingCart } from 'lucide-react';

interface TransaksiKeluar {
  id: number;
  tanggal: string;
  barang: string;
  jumlah: number;
  tujuan: string;
  keterangan: string;
}

const initialTransaksi: TransaksiKeluar[] = [
  { id: 1, tanggal: '2026-04-12', barang: 'Koko Rabbani Premium', jumlah: 15, tujuan: 'Penjualan Toko', keterangan: 'Penjualan retail' },
  { id: 2, tanggal: '2026-04-11', barang: 'Koko Al-Madinah Classic', jumlah: 20, tujuan: 'Penjualan Online', keterangan: 'Order marketplace' },
  { id: 3, tanggal: '2026-04-10', barang: 'Koko Dannis Executive', jumlah: 10, tujuan: 'Penjualan Toko', keterangan: 'Penjualan retail' },
  { id: 4, tanggal: '2026-04-09', barang: 'Koko Ethica Modern', jumlah: 12, tujuan: 'Penjualan Online', keterangan: 'Order WhatsApp' },
];

export default function TransaksiKeluar() {
  const [transaksi, setTransaksi] = useState<TransaksiKeluar[]>(initialTransaksi);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<TransaksiKeluar>>({
    tanggal: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaksi = {
      id: Math.max(...transaksi.map(t => t.id)) + 1,
      ...formData as TransaksiKeluar
    };
    setTransaksi([newTransaksi, ...transaksi]);
    setShowModal(false);
    setFormData({ tanggal: new Date().toISOString().split('T')[0] });
  };

  const totalKeluar = transaksi.reduce((sum, t) => sum + t.jumlah, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Transaksi Barang Keluar</h1>
          <p className="text-gray-400 mt-1">Catat barang yang keluar dari toko</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all"
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
        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30 p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white bg-opacity-20 rounded-lg">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div>
            <p className="text-orange-100">Total Barang Keluar Bulan Ini</p>
            <h2 className="text-4xl font-bold mt-1">{totalKeluar} Unit</h2>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 border border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4 text-orange-400" />
                    No
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    Tanggal
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-400" />
                    Nama Barang
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-orange-400" />
                    Jumlah
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-400" />
                    Tujuan
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-400" />
                    Keterangan
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <AnimatePresence>
                {transaksi.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-orange-500/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                          <span className="text-xs text-orange-400 font-medium">{index + 1}</span>
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
                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                          <Package className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="font-medium text-white">{item.barang}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium border border-orange-500/30">
                        <TrendingDown className="w-3 h-3" />
                        -{item.jumlah}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{item.tujuan}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{item.keterangan}</span>
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
                <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                  <TrendingDown className="w-6 h-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Tambah Transaksi Barang Keluar</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal || ''}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Package className="w-4 h-4 inline mr-1" />
                      Nama Barang
                    </label>
                    <select
                      value={formData.barang || ''}
                      onChange={(e) => setFormData({ ...formData, barang: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                      required
                    >
                      <option value="">Pilih Barang</option>
                      <option value="Koko Rabbani Premium">Koko Rabbani Premium</option>
                      <option value="Koko Al-Madinah Classic">Koko Al-Madinah Classic</option>
                      <option value="Koko Dannis Executive">Koko Dannis Executive</option>
                      <option value="Koko Ethica Modern">Koko Ethica Modern</option>
                      <option value="Koko Shafira Elegant">Koko Shafira Elegant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Jumlah</label>
                    <input
                      type="number"
                      value={formData.jumlah || ''}
                      onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Tujuan
                    </label>
                    <select
                      value={formData.tujuan || ''}
                      onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                      required
                    >
                      <option value="">Pilih Tujuan</option>
                      <option value="Penjualan Toko">Penjualan Toko</option>
                      <option value="Penjualan Online">Penjualan Online</option>
                      <option value="Retur">Retur ke Supplier</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Keterangan</label>
                  <textarea
                    value={formData.keterangan || ''}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                    rows={3}
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all"
                  >
                    Simpan Transaksi
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors border border-gray-600"
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
