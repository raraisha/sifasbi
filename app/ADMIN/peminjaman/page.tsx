'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'

export default function KelolaPeminjamanPage() {
  const router = useRouter()
  const [dataPeminjaman, setDataPeminjaman] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<any | null>(null)
  const [editStatus, setEditStatus] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

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

  useEffect(() => { fetchData() }, [])
  useEffect(() => { if (selectedPeminjaman) setEditStatus(selectedPeminjaman.status) }, [selectedPeminjaman])

  const handleStatusChange = async (peminjaman: any, newStatus: string) => {
    if (newStatus === 'Ditolak') {
      const alasan = prompt('Masukkan alasan penolakan:')
      if (!alasan) {
        toast.error('Alasan penolakan wajib diisi!')
        return
      }
      return updateStatus(peminjaman, newStatus, alasan)
    }

    // kalau disetujui, langsung ubah jadi dipinjam
    if (newStatus === 'Disetujui') newStatus = 'Dipinjam'

    updateStatus(peminjaman, newStatus)
  }

  const updateStatus = async (peminjaman: any, status: string, alasan_penolakan?: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/peminjaman', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_peminjaman: peminjaman.id_peminjaman, status, alasan_penolakan })
      })
      if (!res.ok) throw new Error('Gagal update status')

      setDataPeminjaman(prev =>
        prev.map(item =>
          item.id_peminjaman === peminjaman.id_peminjaman ? { ...item, status } : item
        )
      )
      setSelectedPeminjaman(prev => prev && { ...prev, status })
      toast.success(`Status berhasil diubah menjadi ${status}`)

    } catch (err) {
      console.error(err)
      toast.error('Gagal update status.')
    } finally {
      setUpdating(false)
    }
  }

  const filteredData = dataPeminjaman
    .filter(item => item.nama_peminjam?.toLowerCase().includes(search.toLowerCase()))
    .filter(item => (filter ? item.status === filter : true))

  const tanggalSekarang = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8FD] text-black">
      <Toaster position="top-right" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="bg-white shadow px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Kelola Peminjaman Fasilitas</h1>
            <span className="text-sm text-gray-500">{tanggalSekarang}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search nama peminjam..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Ditolak">Ditolak</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

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
                {filteredData.map(row => (
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
                            onClick={() => handleStatusChange(row, 'Disetujui')}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                          >Terima</button>
                          <button
                            onClick={() => handleStatusChange(row, 'Ditolak')}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                          >Tolak</button>
                        </>
                      )}
                      {row.status === 'Dipinjam' && (
                        <button
                          onClick={() => handleStatusChange(row, 'Selesai')}
                          className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                        >Selesai</button>
                      )}
                      <button
                        onClick={() => setSelectedPeminjaman(row)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                      >Detail</button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-4 text-gray-500">Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedPeminjaman && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-[700px] shadow-2xl relative flex gap-6">
                <button
                  onClick={() => setSelectedPeminjaman(null)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                >×</button>

                <div className="flex-1 space-y-3 text-gray-800">
                  <h2 className="text-lg font-extrabold mb-2 text-gray-900 text-center">
                    Detail Peminjaman ID {selectedPeminjaman.id_peminjaman}
                  </h2>

                  {[
                    { label: 'Nama Peminjam', value: selectedPeminjaman.nama_peminjam },
                    { label: 'Fasilitas', value: selectedPeminjaman.nama_barang },
                    { label: 'Keperluan', value: selectedPeminjaman.keperluan },
                    { label: 'Waktu Pinjam', value: formatWaktu(selectedPeminjaman.waktu_pinjam) },
                    { label: 'Waktu Selesai', value: formatWaktu(selectedPeminjaman.waktu_selesai) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block font-semibold mb-1">{label}</label>
                      <input
                        type="text" value={value || ''} readOnly
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={editStatus || ''}
                      onChange={e => handleStatusChange(selectedPeminjaman, e.target.value)}
                      disabled={updating}
                      className="w-full border rounded px-3 py-1"
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Dipinjam">Dipinjam</option>
                      <option value="Ditolak">Ditolak</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setSelectedPeminjaman(null)}
                    className="mt-4 w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition"
                  >Tutup</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function formatWaktu(waktu: string) {
  if (!waktu) return '-'
  const t = new Date(waktu)
  if (isNaN(t.getTime())) return '-'
  return `${t.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
}
