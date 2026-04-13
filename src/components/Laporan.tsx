import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, Filter, Package, TrendingUp, TrendingDown, Database } from 'lucide-react';
import { InventoryDatePicker } from '@/components/InventoryDatePicker';

type LaporanType = 'barang' | 'masuk' | 'keluar' | 'stok';

export default function Laporan() {
  const [activeReport, setActiveReport] = useState<LaporanType>('barang');
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-13');

  const reports = [
    { id: 'barang' as LaporanType, name: 'Data Barang', icon: Package, color: 'blue' },
    { id: 'masuk' as LaporanType, name: 'Barang Masuk', icon: TrendingUp, color: 'emerald' },
    { id: 'keluar' as LaporanType, name: 'Barang Keluar', icon: TrendingDown, color: 'orange' },
    { id: 'stok' as LaporanType, name: 'Stok Akhir', icon: Database, color: 'purple' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const dataBarang = [
    { kode: 'BRG001', nama: 'Koko Rabbani Premium', merk: 'Rabbani', stok: 145, harga: 250000 },
    { kode: 'BRG002', nama: 'Koko Al-Madinah Classic', merk: 'Al-Madinah', stok: 132, harga: 220000 },
    { kode: 'BRG003', nama: 'Koko Dannis Executive', merk: 'Dannis', stok: 128, harga: 280000 },
    { kode: 'BRG004', nama: 'Koko Ethica Modern', merk: 'Ethica', stok: 115, harga: 235000 },
  ];

  const dataMasuk = [
    { tanggal: '10/04/2026', barang: 'Koko Rabbani Premium', jumlah: 50, supplier: 'PT Rabbani Textile' },
    { tanggal: '09/04/2026', barang: 'Koko Al-Madinah Classic', jumlah: 30, supplier: 'CV Al-Madinah Fashion' },
    { tanggal: '08/04/2026', barang: 'Koko Dannis Executive', jumlah: 40, supplier: 'UD Dannis Collection' },
  ];

  const dataKeluar = [
    { tanggal: '12/04/2026', barang: 'Koko Rabbani Premium', jumlah: 15, tujuan: 'Penjualan Toko' },
    { tanggal: '11/04/2026', barang: 'Koko Al-Madinah Classic', jumlah: 20, tujuan: 'Penjualan Online' },
    { tanggal: '10/04/2026', barang: 'Koko Dannis Executive', jumlah: 10, tujuan: 'Penjualan Toko' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Laporan Persediaan</h1>
          <p className="text-gray-400 mt-1">Lihat dan cetak laporan inventori</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
        >
          <Download className="w-5 h-5" />
          Cetak Laporan
        </motion.button>
      </motion.div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report, index) => (
          <motion.button
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => setActiveReport(report.id)}
            className={`p-6 rounded-xl shadow-lg border-2 transition-all ${
              activeReport === report.id
                ? `border-${report.color}-500 bg-${report.color}-500/20 shadow-${report.color}-500/30`
                : 'border-gray-700 bg-gray-800 hover:border-gray-600 shadow-black/50'
            }`}
          >
            <div className={`p-3 rounded-lg inline-block mb-3 ${
              activeReport === report.id ? `bg-${report.color}-500/20 border border-${report.color}-500/30` : 'bg-gray-700 border border-gray-600'
            }`}>
              <report.icon className={`w-6 h-6 ${
                activeReport === report.id ? `text-${report.color}-400` : 'text-gray-400'
              }`} />
            </div>
            <p className={`font-medium ${
              activeReport === report.id ? `text-${report.color}-400` : 'text-gray-300'
            }`}>
              {report.name}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Filter Section */}
      {(activeReport === 'masuk' || activeReport === 'keluar') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-white">Filter Tanggal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dari Tanggal</label>
              <InventoryDatePicker
                value={dateFrom}
                onChange={setDateFrom}
                accent="blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sampai Tanggal</label>
              <InventoryDatePicker
                value={dateTo}
                onChange={setDateTo}
                accent="blue"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Report Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 border border-gray-700 overflow-hidden"
      >
        {/* Report Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">TOKO EL-HIBBANI</h2>
            <p className="text-gray-400 mt-1">Sistem Informasi Persediaan Barang</p>
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white">
                Laporan {reports.find(r => r.id === activeReport)?.name}
              </h3>
              {(activeReport === 'masuk' || activeReport === 'keluar') && (
                <p className="text-sm text-gray-400 mt-1">
                  Periode: {new Date(dateFrom).toLocaleDateString('id-ID')} - {new Date(dateTo).toLocaleDateString('id-ID')}
                </p>
              )}
              <p className="text-sm text-gray-400">
                Dicetak pada: {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto p-6">
          {activeReport === 'barang' && (
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Kode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Merk</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Stok</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Harga</th>
                </tr>
              </thead>
              <tbody>
                {dataBarang.map((item, index) => (
                  <tr key={item.kode} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.kode}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.nama}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.merk}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.stok}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">Rp {item.harga.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'masuk' && (
            <table className="w-full">
              <thead className="bg-emerald-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Jumlah</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {dataMasuk.map((item, index) => (
                  <tr key={index} className="hover:bg-emerald-500/10">
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.tanggal}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.barang}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium border border-gray-700">+{item.jumlah}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.supplier}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-500/20 font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-right text-white border border-gray-700">Total Barang Masuk:</td>
                  <td className="px-4 py-3 text-emerald-400 border border-gray-700">{dataMasuk.reduce((sum, item) => sum + item.jumlah, 0)} Unit</td>
                  <td className="border border-gray-700"></td>
                </tr>
              </tbody>
            </table>
          )}

          {activeReport === 'keluar' && (
            <table className="w-full">
              <thead className="bg-orange-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Jumlah</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Tujuan</th>
                </tr>
              </thead>
              <tbody>
                {dataKeluar.map((item, index) => (
                  <tr key={index} className="hover:bg-orange-500/10">
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.tanggal}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.barang}</td>
                    <td className="px-4 py-3 text-orange-400 font-medium border border-gray-700">-{item.jumlah}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.tujuan}</td>
                  </tr>
                ))}
                <tr className="bg-orange-500/20 font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-right text-white border border-gray-700">Total Barang Keluar:</td>
                  <td className="px-4 py-3 text-orange-400 border border-gray-700">{dataKeluar.reduce((sum, item) => sum + item.jumlah, 0)} Unit</td>
                  <td className="border border-gray-700"></td>
                </tr>
              </tbody>
            </table>
          )}

          {activeReport === 'stok' && (
            <table className="w-full">
              <thead className="bg-purple-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Kode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Merk</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Stok Akhir</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border border-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {dataBarang.map((item, index) => (
                  <tr key={item.kode} className="hover:bg-purple-500/10">
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.kode}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.nama}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700">{item.merk}</td>
                    <td className="px-4 py-3 text-gray-300 border border-gray-700 font-medium">{item.stok} Pcs</td>
                    <td className="px-4 py-3 border border-gray-700">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.stok > 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        item.stok > 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {item.stok > 100 ? 'Aman' : item.stok > 50 ? 'Cukup' : 'Rendah'}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-purple-500/20 font-semibold">
                  <td colSpan={4} className="px-4 py-3 text-right text-white border border-gray-700">Total Stok Keseluruhan:</td>
                  <td className="px-4 py-3 text-purple-400 border border-gray-700">{dataBarang.reduce((sum, item) => sum + item.stok, 0)} Pcs</td>
                  <td className="border border-gray-700"></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-300">Toko El-Hibbani</p>
              <p className="text-xs text-gray-500">Sistem Informasi Persediaan Barang</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">(.......................)</p>
              <p className="text-xs text-gray-500 mt-1">Admin</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
