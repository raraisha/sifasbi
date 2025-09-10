'use client'

import { usePathname } from 'next/navigation'
import { FiHome, FiTool, FiBook, FiArchive, FiBarChart2, FiMenu, FiX } from 'react-icons/fi'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { useState } from 'react'

const menu = [
  { label: 'Dashboard', icon: <FiHome />, href: '/ADMIN/dashboard-admin' },
  { label: 'Laporan Kerusakan', icon: <FiTool />, href: '/ADMIN/laporan-kerusakan' },
  { label: 'Peminjaman', icon: <FiBook />, href: '/ADMIN/peminjaman' },
  { label: 'Kelola Inventaris', icon: <FiArchive />, href: '/ADMIN/kelola-inventaris' },
  { label: 'Histori Data', icon: <FiBook />, href: '/ADMIN/log-aktivitas' },
  { label: 'Laporan & Statistik', icon: <FiBarChart2 />, href: '#' },
]

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Tombol Burger (hanya muncul di mobile) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8" />
          <h1 className="text-lg font-bold">
            <span className="text-[#B36FF2]">Si</span>
            <span className="text-[#273B98]">FasBi</span>
          </h1>
        </div>
        <button onClick={() => setOpen(!open)} className="text-2xl text-gray-700">
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow flex flex-col justify-between py-6 transform transition-transform duration-300 z-50 
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}
      >
        <div>
          {/* Logo (hidden di mobile karena sudah di header) */}
          <div className="hidden lg:flex flex-col items-center mb-10">
            <img src="/logo.png" alt="Logo" className="w-10 mb-2" />
            <h1 className="text-xl font-bold">
              <span className="text-[#B36FF2]">Si</span>
              <span className="text-[#273B98]">FasBi</span>
            </h1>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menu.map((item) => (
              <Link key={item.label} href={item.href} passHref>
                <div
                  onClick={() => setOpen(false)} // biar nutup sidebar setelah klik
                  className={`flex items-center px-5 py-2 rounded-md font-medium cursor-pointer transition ${
                    path === item.href
                      ? 'bg-[#EEE7FF] text-[#6C3BD9]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span> {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-5 text-xs text-gray-500 flex flex-col">
          <LogoutButton />
          <p className="mt-4">© SMK Bina Informatika 2025. All Rights Reserved.</p>
        </div>
      </div>

      {/* Overlay hitam (kalau sidebar kebuka di mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        />
      )}
    </>
  )
}
