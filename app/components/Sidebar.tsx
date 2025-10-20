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
  { label: 'Laporan & Statistik', icon: <FiBarChart2 />, href: '/ADMIN/statistik' },
]

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Header Mobile */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-50">
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
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-white to-[#F9F8FD] shadow-xl flex flex-col justify-between 
        transform transition-transform duration-300 z-50 
        ${open ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center py-8 space-y-2">
          <img src="/logo.png" alt="Logo" className="w-20 drop-shadow-md" />
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-[#B36FF2]">Si</span>
            <span className="text-[#273B98]">FasBi</span>
          </h1>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-5 space-y-1 mt-4">
          {menu.map((item) => {
            const active = path === item.href
            return (
              <Link key={item.label} href={item.href}>
                <div
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all cursor-pointer
                    ${
                      active
                        ? 'bg-gradient-to-r from-[#B36FF2] to-[#7E9BFF] text-white shadow-md'
                        : 'text-gray-700 hover:bg-[#F3EEFF] hover:text-[#6C3BD9]'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 text-center bg-white/70 backdrop-blur-md rounded-t-2xl shadow-sm">
          <LogoutButton />
          <p className="mt-4 text-xs text-gray-500 leading-snug">
            © 2025 SMK Bina Informatika <br /> All Rights Reserved
          </p>
        </div>
      </aside>

      {/* Overlay untuk mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}
    </>
  )
}
