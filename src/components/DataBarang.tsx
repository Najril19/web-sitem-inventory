import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { barangApi } from '@/lib/api';

interface Barang {
  id: number;
  kode: string;
  nama: string;
  merk: string;
  satuan: string;
  stok: number;
  harga: number;
}

const initialBarang: Barang[] = [
  { id: 1, kode: 'BRG001', nama: 'Koko Rabbani Premium', merk: 'Rabbani', satuan: 'Pcs', stok: 145, harga: 250000 },
  { id: 2, kode: 'BRG002', nama: 'Koko Al-Madinah Classic', merk: 'Al-Madinah', satuan: 'Pcs', stok: 132, harga: 220000 },
  { id: 3, kode: 'BRG003', nama: 'Koko Dannis Executive', merk: 'Dannis', satuan: 'Pcs', stok: 128, harga: 280000 },
  { id: 4, kode: 'BRG004', nama: 'Koko Ethica Modern', merk: 'Ethica', satuan: 'Pcs', stok: 115, harga: 235000 },
  { id: 5, kode: 'BRG005', nama: 'Koko Shafira Elegant', merk: 'Shafira', satuan: 'Pcs', stok: 98, harga: 265000 },
  { id: 6, kode: 'BRG006', nama: 'Koko Zoya Premium', merk: 'Zoya', satuan: 'Pcs', stok: 87, harga: 290000 },
  { id: 7, kode: 'BRG007', nama: 'Koko Al-Ikhwan Bordir', merk: 'Al-Ikhwan', satuan: 'Pcs', stok: 76, harga: 245000 },
  { id: 8, kode: 'BRG008', nama: 'Koko Ammar Classic', merk: 'Ammar', satuan: 'Pcs', stok: 64, harga: 215000 },
];

export default function DataBarang() {
  const [barang, setBarang] = useState<Barang[]>(initialBarang);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Barang | null>(null);
  const [formData, setFormData] = useState<Partial<Barang>>({});

  const filteredBarang = barang.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.merk.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      setBarang(barang.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setBarang(barang.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
    } else {
      const newItem = {
        id: Math.max(...barang.map(b => b.id)) + 1,
        ...formData as Barang
      };
      setBarang([...barang, newItem]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 border border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Nama Barang</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Merk</th>
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
                    <td className="px-6 py-4 font-medium text-white">{item.kode}</td>
                    <td className="px-6 py-4 text-gray-300">{item.nama}</td>
                    <td className="px-6 py-4 text-gray-300">{item.merk}</td>
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
                    <td className="px-6 py-4 text-gray-300">Rp {item.harga.toLocaleString('id-ID')}</td>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kode Barang</label>
                    <input
                      type="text"
                      value={formData.kode || ''}
                      onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nama Barang</label>
                    <input
                      type="text"
                      value={formData.nama || ''}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Merk</label>
                    <input
                      type="text"
                      value={formData.merk || ''}
                      onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Satuan</label>
                    <select
                      value={formData.satuan || ''}
                      onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      required
                    >
                      <option value="">Pilih Satuan</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Lusin">Lusin</option>
                      <option value="Pack">Pack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stok</label>
                    <input
                      type="number"
                      value={formData.stok || ''}
                      onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Harga</label>
                    <input
                      type="number"
                      value={formData.harga || ''}
                      onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all"
                  >
                    {editingItem ? 'Simpan Perubahan' : 'Tambah Barang'}
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
