'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  Truck,
  TrendingUp,
  TrendingDown,
  FileText,
  Menu,
  X,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import Login from './Login';
import Dashboard from './Dashboard';
import DataBarang from './DataBarang';
import DataSupplier from './DataSupplier';
import TransaksiMasuk from './TransaksiMasuk';
import TransaksiKeluar from './TransaksiKeluar';
import Laporan from './Laporan';

type Page = 'dashboard' | 'barang' | 'supplier' | 'masuk' | 'keluar' | 'laporan';

const menuItems = [
  { id: 'dashboard' as Page, name: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
  { id: 'barang' as Page, name: 'Data Barang', icon: Package, color: 'emerald' },
  { id: 'supplier' as Page, name: 'Data Supplier', icon: Truck, color: 'blue' },
  { id: 'masuk' as Page, name: 'Barang Masuk', icon: TrendingUp, color: 'emerald' },
  { id: 'keluar' as Page, name: 'Barang Keluar', icon: TrendingDown, color: 'orange' },
  { id: 'laporan' as Page, name: 'Laporan', icon: FileText, color: 'purple' },
];

export default function AppShell() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const openLogoutDialog = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
    setShowLogoutConfirm(false);
    setIsSidebarOpen(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'barang':
        return <DataBarang />;
      case 'supplier':
        return <DataSupplier />;
      case 'masuk':
        return <TransaksiMasuk />;
      case 'keluar':
        return <TransaksiKeluar />;
      case 'laporan':
        return <Laporan />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden lg:flex lg:flex-col lg:w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed h-screen shadow-2xl z-40"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">El-Hibbani</h1>
              <p className="text-xs text-gray-400">Sistem Inventori</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === item.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openLogoutDialog}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl z-50 lg:hidden flex flex-col"
            >
              {/* Logo */}
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">El-Hibbani</h1>
                    <p className="text-xs text-gray-400">Sistem Inventori</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentPage === item.id
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={openLogoutDialog}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30 shadow-lg"
        >
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-semibold text-white lg:hidden">
                {menuItems.find(item => item.id === currentPage)?.name}
              </h2>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-gray-400">Toko El-Hibbani</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-emerald-500/50">
                A
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            role="presentation"
            onClick={cancelLogout}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-dialog-title"
              aria-describedby="logout-dialog-desc"
              className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-600 bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl shadow-black/80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-full bg-gradient-to-r from-red-500 via-red-600 to-rose-600" />
              <div className="p-6 sm:p-8">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/40">
                  <LogOut className="size-7 text-red-400" strokeWidth={2} />
                </div>
                <h2
                  id="logout-dialog-title"
                  className="text-center text-xl font-bold text-white sm:text-2xl"
                >
                  Logout
                </h2>
                <p
                  id="logout-dialog-desc"
                  className="mt-3 text-center text-sm leading-relaxed text-gray-400 sm:text-base"
                >
                  Apakah Anda yakin ingin logout?
                </p>
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelLogout}
                    className="w-full rounded-xl border border-gray-600 bg-gray-700/80 px-5 py-3 text-sm font-semibold text-white shadow-inner transition-colors hover:bg-gray-700 sm:w-auto"
                  >
                    No
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmLogout}
                    className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/35 transition-shadow hover:shadow-xl sm:w-auto"
                  >
                    Yes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
