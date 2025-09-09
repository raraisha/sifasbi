'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8FD]">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4 flex justify-between items-center shadow relative">
        {/* Logo kiri */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10" />
          <span className="text-white font-bold text-xl">SiFasBi</span>
        </div>

        {/* Menu tengah (hidden di mobile) */}
        <div className="hidden md:flex items-center gap-8 text-white font-medium">
          <Link href="/dashboard-siswa/dashboard" className="hover:underline">Home</Link>
          <Link href="/dashboard-siswa/peminjaman" className="hover:underline">Pinjam Fasilitas</Link>
          <Link href="/dashboard-siswa/lapor" className="hover:underline">Lapor Kerusakan</Link>
          <Link href="/siswa/histori" className="hover:underline">Histori</Link>
        </div>

        {/* Tombol logout (desktop) */}
        <div className="hidden md:block">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <span>🚪</span> Logout
          </button>
        </div>

        {/* Burger Menu Button (mobile) */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Dropdown Menu (mobile) */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-indigo-600 text-white flex flex-col p-4 space-y-4 shadow-md md:hidden">
            <Link
              href="/dashboard-siswa/dashboard"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/dashboard-siswa/peminjaman"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Pinjam Fasilitas
            </Link>
            <Link
              href="/dashboard-siswa/lapor"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Lapor Kerusakan
            </Link>
            <Link
              href="/siswa/histori"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Histori
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false)
                handleLogout()
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Isi halaman */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
