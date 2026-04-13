'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, TrendingUp, TrendingDown, Database, BarChart3, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statsData = [
  { icon: Package, label: 'Total Data Barang', value: '247', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: Database, label: 'Total Stok Barang', value: '12,845', color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { icon: TrendingUp, label: 'Barang Masuk (Bulan Ini)', value: '156', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
  { icon: TrendingDown, label: 'Barang Keluar (Bulan Ini)', value: '89', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
];

const monthlyData = [
  { month: 'Jan', masuk: 120, keluar: 80 },
  { month: 'Feb', masuk: 150, keluar: 95 },
  { month: 'Mar', masuk: 180, keluar: 110 },
  { month: 'Apr', masuk: 156, keluar: 89 },
];

const topProducts = [
  { name: 'Koko Rabbani Premium', stock: 145, brand: 'Rabbani' },
  { name: 'Koko Al-Madinah Classic', stock: 132, brand: 'Al-Madinah' },
  { name: 'Koko Dannis Executive', stock: 128, brand: 'Dannis' },
  { name: 'Koko Ethica Modern', stock: 115, brand: 'Ethica' },
  { name: 'Koko Shafira Elegant', stock: 98, brand: 'Shafira' },
];

function RechartsClientOnly({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return <div className="h-[250px] w-full rounded-lg bg-gray-900/50" aria-hidden />;
  }
  return <>{children}</>;
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Selamat datang di Sistem Inventori Toko El-Hibbani</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-300">13 April 2026</span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 p-6 border border-gray-700 hover:shadow-xl hover:shadow-black/70 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              </div>
              <div className={`bg-gray-900/50 p-3 rounded-lg border border-gray-700`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className={`mt-4 h-1 bg-gradient-to-r ${stat.color} rounded-full shadow-lg`}></div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-white">Statistik Transaksi Bulanan</h2>
          </div>
          <RechartsClientOnly>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="masuk" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="keluar" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </RechartsClientOnly>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
              <span className="text-sm text-gray-300">Barang Masuk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
              <span className="text-sm text-gray-300">Barang Keluar</span>
            </div>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-lg shadow-black/50 p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Top 5 Stok Barang</h2>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-gray-400">{product.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{product.stock}</p>
                  <p className="text-xs text-gray-400">Unit</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
