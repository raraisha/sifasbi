'use client'

import { usePathname } from 'next/navigation'
import { FiHome, FiTool, FiBook, FiArchive, FiBarChart2 } from 'react-icons/fi'
import Link from 'next/link'
import LogoutButton from './LogoutButton'


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

  return (
    <div className="h-screen w-64 bg-white shadow flex flex-col justify-between py-6">
      <div>
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Logo" className="w-10 mb-2" />
          <h1 className="text-xl font-bold">
            <span className="text-[#B36FF2]">Si</span>
            <span className="text-[#273B98]">FasBi</span>
          </h1>
        </div>

        <nav className="space-y-2">
          {menu.map((item) => (
            <Link key={item.label} href={item.href} passHref>
              <div
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

      <div className="px-5 text-xs text-gray-500 flex flex-col">
        {/* ganti Link logout lama dengan LogoutButton */}
        <LogoutButton />
        <p className="mt-4">© SMK Bina Informatika 2025. All Rights Reserved.</p>
      </div>
    </div>
  )
}
