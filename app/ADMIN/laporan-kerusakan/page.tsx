'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'


export default function LaporanKerusakanPage() {
  const router = useRouter()
  const [dataKerusakan, setDataKerusakan] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [namaUser, setNamaUser] = useState('')
  const [selectedLaporan, setSelectedLaporan] = useState<any | null>(null)

  // State untuk edit status modal
  const [editStatus, setEditStatus] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const handleDetailClick = (laporan: any) => {
    setSelectedLaporan(laporan)
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setNamaUser(parsed.nama)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/laporan-kerusakan')
        if (!res.ok) throw new Error('Gagal ambil data')
        const data = await res.json()
        setDataKerusakan(data)
      } catch (err) {
        console.error(err)
        const storedUser = localStorage.getItem('user')
        if (!storedUser) router.push('/login')
      }
    }
    fetchData()
  }, [router])

  // Sync editStatus saat modal terbuka
  useEffect(() => {
    if (selectedLaporan) {
      setEditStatus(selectedLaporan.status)
    }
  }, [selectedLaporan])

  // Update status ke backend
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedLaporan) return
    setEditStatus(newStatus)
    setUpdating(true)
    try {
      const res = await fetch(`/api/dashboard/laporan-kerusakan/${selectedLaporan.id_pelaporan}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Gagal update status')

      // Update state lokal supaya UI langsung berubah
      setDataKerusakan((prev) =>
        prev.map((item) =>
          item.id_pelaporan === selectedLaporan.id_pelaporan
            ? { ...item, status: newStatus }
            : item
        )
      )
      setSelectedLaporan((prev: typeof selectedLaporan) => prev && { ...prev, status: newStatus })
    } catch (error) {
      console.error(error)
      alert('Gagal update status, coba lagi ya.')
      setEditStatus(selectedLaporan.status) // rollback status
    } finally {
      setUpdating(false)
    }
  }

  const filteredData = dataKerusakan
    .filter((item: any) =>
      item.id_siswa?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((item: any) => (filter ? item.status === filter : true))

  return (
    <div className="flex min-h-screen bg-[#F9F8FD]">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6 text-black">Kelola Laporan Kerusakan</h1>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by ID Siswa..."
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
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse text-black">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">ID Siswa</th>
                <th className="px-4 py-2">Nama Barang</th>
                <th className="px-4 py-2">Waktu Lapor</th>
                <th className="px-4 py-2">Ruangan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row: any) => (
                <tr key={row.id_pelaporan} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{row.id_pelaporan}</td>
                  <td className="px-4 py-2">{row.id_siswa}</td>
                  <td className="px-4 py-2">{row.nama_barang}</td>
                  <td className="px-4 py-2">{formatWaktu(row.waktu_dibuat)}</td>
                  <td className="px-4 py-2">{row.ruangan}</td>
                  <td className="px-4 py-2">{row.status}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDetailClick(row)}
                      className="bg-gradient-to-r from-purple-400 to-blue-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110 transition"
                    >
                      Detail
                    </button>
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

        {/* Modal Detail Laporan */}
        {selectedLaporan && (
          <div
            className="fixed inset-0 z-50 flex justify-center items-start pt-20 overflow-y-auto"
            style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-2xl mb-10"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <button
                onClick={() => setSelectedLaporan(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                aria-label="Close modal"
              >
                ×
              </button>
              <h2 className="text-center font-extrabold mb-5 text-xl text-gray-900">
                Detail Laporan ID {selectedLaporan.id_pelaporan}
              </h2>
              <img
                src={selectedLaporan.foto_url}
                alt="Foto Kerusakan"
                className="w-48 h-48 object-cover mx-auto mb-6 rounded-lg border border-gray-300 shadow-sm"
              />
              <div className="space-y-4 text-gray-800">
                {[
                  { label: 'NIS Pelapor', value: selectedLaporan.id_siswa },
                  { label: 'Nama Pelapor', value: selectedLaporan.nama_pelapor },
                  { label: 'Fasilitas', value: selectedLaporan.fasilitas },
                  { label: 'Gedung', value: selectedLaporan.gedung },
                  { label: 'Ruangan', value: selectedLaporan.ruangan },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="block font-semibold mb-1">{label}</label>
                    <input
                      type="text"
                      value={value}
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                    />
                  </div>
                ))}
                <div>
                  <label className="block font-semibold mb-1">Deskripsi</label>
                  <textarea
                    value={selectedLaporan.deskripsi}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                 <select
  value={selectedLaporan.status}
  onChange={(e) => handleStatusChange(e.target.value)}
  className="w-full border rounded px-3 py-1"
>
  <option value="Konfirmasi">Konfirmasi</option>
  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
  <option value="Ditolak">Ditolak</option>
</select>

                </div>
                {editStatus === 'Ditolak' && (
                  <div>
                    <label className="block font-semibold mb-1">Alasan Penolakan</label>
<textarea
  value={selectedLaporan.alasan_penolakan || ''}
  readOnly
  className="w-full border rounded px-3 py-1"
  rows={2}
/>

                  </div>
                )}
                <button
                  onClick={() => setSelectedLaporan(null)}
                  className="mt-6 w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
