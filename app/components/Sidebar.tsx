'use client'

import { usePathname } from 'next/navigation'
import { FiHome, FiTool, FiBook, FiArchive, FiBarChart2, FiMenu, FiX, FiChevronRight } from 'react-icons/fi'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { useState } from 'react'

const menu = [
  { label: 'Dashboard', icon: <FiHome />, href: '/ADMIN/dashboard-admin' },
  { label: 'Laporan Kerusakan', icon: <FiTool />, href: '/ADMIN/laporan-kerusakan' },
  { label: 'Peminjaman', icon: <FiBook />, href: '/ADMIN/peminjaman' },
  { label: 'Kelola Inventaris', icon: <FiArchive />, href: '/ADMIN/kelola-inventaris' },
  { label: 'Laporan & Statistik', icon: <FiBarChart2 />, href: '/ADMIN/statistik' },
]

export default function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Header Mobile dengan Glassmorphism */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
            <img src="/logo.png" alt="Logo" className="w-10 relative drop-shadow-lg" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-[#B36FF2] to-purple-600 bg-clip-text text-transparent">Si</span>
            <span className="bg-gradient-to-r from-[#273B98] to-indigo-700 bg-clip-text text-transparent">FasBi</span>
          </h1>
        </div>
        <button 
          onClick={() => setOpen(!open)} 
          className="p-2 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-300 text-gray-700 hover:scale-110"
        >
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar dengan Enhanced Design */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/40 shadow-2xl flex flex-col justify-between 
        transform transition-all duration-500 ease-out z-50 border-r border-purple-100/50
        ${open ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static`}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-300/20 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-300/20 to-transparent rounded-tr-full"></div>

        {/* Logo Section dengan Glow Effect */}
        <div className="relative flex flex-col items-center py-10 space-y-4">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            
            {/* Logo Container */}
            <div className="relative bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 shadow-xl group-hover:scale-105 transition-transform duration-500">
              <img src="/logo.png" alt="Logo" className="w-20 drop-shadow-2xl" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#B36FF2] via-purple-600 to-purple-700 bg-clip-text text-transparent">Si</span>
              <span className="bg-gradient-to-r from-[#273B98] via-blue-700 to-indigo-800 bg-clip-text text-transparent">FasBi</span>
            </h1>
            <p className="text-xs text-gray-500 mt-2 font-medium">Admin Dashboard</p>
          </div>
        </div>

        {/* Menu Navigasi dengan Enhanced Styling */}
        <nav className="relative flex-1 px-4 space-y-2 mt-2">
          {menu.map((item, idx) => {
            const active = path === item.href
            return (
              <Link key={item.label} href={item.href}>
                <div
                  onClick={() => setOpen(false)}
                  className={`group relative flex items-center gap-4 px-5 py-3.5 rounded-2xl font-semibold transition-all duration-300 cursor-pointer overflow-hidden
                    ${
                      active
                        ? 'bg-gradient-to-r from-[#B36FF2] to-[#6C3BD9] text-white shadow-lg shadow-purple-500/40 scale-105'
                        : 'text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-102'
                    }`}
                  style={{ 
                    animationDelay: `${idx * 50}ms`,
                    animation: 'fadeInLeft 0.5s ease-out forwards'
                  }}
                >
                  {/* Hover gradient effect */}
                  {!active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  )}
                  
                  {/* Active indicator bar */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-lg"></div>
                  )}
                  
                  {/* Icon with background */}
                  <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 
                    ${active 
                      ? 'bg-white/20 shadow-lg' 
                      : 'bg-gradient-to-br from-purple-100 to-blue-100 group-hover:from-purple-200 group-hover:to-blue-200'
                    }`}>
                    <span className={`text-xl ${active ? 'text-white' : 'text-purple-600'}`}>
                      {item.icon}
                    </span>
                  </div>
                  
                  <span className="relative z-10 flex-1">{item.label}</span>
                  
                  {/* Chevron indicator */}
                  <FiChevronRight 
                    className={`relative z-10 transition-all duration-300 
                      ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} 
                  />
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer dengan Enhanced Design */}
        <div className="relative px-6 py-6 mt-4 bg-gradient-to-r from-white/90 to-purple-50/50 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-purple-100/50">
          {/* Decorative top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full"></div>
          
          <LogoutButton />
          
          <div className="mt-5 pt-4 border-t border-gray-200/50">
            <p className="text-xs text-gray-500 leading-relaxed text-center font-medium">
              © 2025 <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">SMK Bina Informatika</span>
              <br />
              <span className="text-[10px] text-gray-400">All Rights Reserved</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay dengan Enhanced Blur */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-gradient-to-br from-black/60 to-purple-900/40 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        />
      )}

      <style jsx global>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}