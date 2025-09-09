'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'


export default function KelolaPeminjamanPage() {
  const router = useRouter()
  const [dataPeminjaman, setDataPeminjaman] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const fetchData = async () => {
    try {
      const res = await fetch('/api/peminjaman')
      if (!res.ok) throw new Error('Gagal ambil data')
      const data = await res.json()
      setDataPeminjaman(data)
    } catch (err) {
      console.error(err)
      router.push('/login')
    }
  }

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch('/api/peminjaman', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      if (!res.ok) throw new Error('Gagal update status')
      setDataPeminjaman(prev => prev.map(item =>
        item.id_peminjaman === id ? { ...item, status: newStatus } : item
      ))
    } catch (err) {
      console.error(err)
      alert('Update status gagal.')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredData = dataPeminjaman
    .filter(item =>
      item.nama_peminjam?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(item => (filter ? item.status === filter : true))

  return (
    <div className="flex min-h-screen bg-[#F9F8FD]">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6 text-black">Kelola Peminjaman Fasilitas</h1>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search nama peminjam..."
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Semua</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse text-black">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Peminjam</th>
                <th className="px-4 py-2">Fasilitas</th>
                <th className="px-4 py-2">Waktu Pinjam</th>
                <th className="px-4 py-2">Waktu Selesai</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id_peminjaman} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{row.id_peminjaman}</td>
                  <td className="px-4 py-2">{row.nama_peminjam}</td>
                  <td className="px-4 py-2">{row.nama_barang}</td>
                  <td className="px-4 py-2">{formatWaktu(row.waktu_pinjam)}</td>
                  <td className="px-4 py-2">{formatWaktu(row.waktu_selesai)}</td>
                  <td className="px-4 py-2">{row.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {row.status === 'Menunggu' && (
                      <>
                        <button
                          onClick={() => updateStatus(row.id_peminjaman, 'Disetujui')}
                          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => updateStatus(row.id_peminjaman, 'Ditolak')}
                          className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                    {row.status === 'Disetujui' && (
                      <button
                        onClick={() => updateStatus(row.id_peminjaman, 'Selesai')}
                        className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                      >
                        Selesai
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function formatWaktu(waktu: string) {
  const t = new Date(waktu)
  return `${t.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })} ${t.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })} WIB`
}
