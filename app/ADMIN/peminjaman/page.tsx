'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/peminjaman')
        if (!res.ok) return
        const latestData = await res.json()
        if (latestData.length > dataPeminjaman.length) toast.success('Ada peminjaman baru masuk!')
        setDataPeminjaman(latestData)
      } catch (err) { console.error(err) }
    }, 5000)
    return () => clearInterval(interval)
  }, [dataPeminjaman])

  const handleStatusChange = async (peminjaman: any, newStatus: string) => {
    let alasan = ''
    if (newStatus === 'Ditolak') {
      alasan = prompt('Masukkan alasan penolakan:') || ''
      if (!alasan.trim()) {
        toast.error('Alasan penolakan wajib diisi!')
        return
      }
    }

    // kalau disetujui, langsung ubah jadi dipinjam
    if (newStatus === 'Disetujui') newStatus = 'Dipinjam'

    setSelectedPeminjaman(peminjaman)
    setEditStatus(newStatus)
    setUpdating(true)
    try {
      const res = await fetch('/api/peminjaman', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_peminjaman: peminjaman.id_peminjaman, status: newStatus, alasan_penolakan: alasan })
      })
      if (!res.ok) throw new Error('Gagal update status')

      setDataPeminjaman(prev =>
        prev.map(item =>
          item.id_peminjaman === peminjaman.id_peminjaman
            ? { ...item, status: newStatus, alasan_penolakan: alasan }
            : item
        )
      )
      setSelectedPeminjaman(prev => prev && { ...prev, status: newStatus, alasan_penolakan: alasan })
      toast.success('Status berhasil diperbarui!')

    } catch (err) {
      console.error(err)
      toast.error('Gagal update status, coba lagi ya.')
      setEditStatus(peminjaman.status)
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

  const getStatusBadge = (status: string) => {
    const styles = {
      'Menunggu': 'bg-amber-100 text-amber-800 border-amber-300',
      'Dipinjam': 'bg-blue-100 text-blue-800 border-blue-300',
      'Selesai': 'bg-green-100 text-green-800 border-green-300',
      'Ditolak': 'bg-red-100 text-red-800 border-red-300',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-black">
      <Toaster position="top-right" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl px-6 py-5 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">Kelola Peminjaman Fasilitas</h1>
              <p className="text-indigo-100 text-sm mt-1">Pantau dan kelola peminjaman fasilitas</p>
            </div>
            <span className="text-sm text-indigo-100 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              {tanggalSekarang}
            </span>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari Nama Peminjam..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-black transition-all"
                value={search} 
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-black appearance-none bg-white transition-all"
                value={filter} 
                onChange={e => setFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Dipinjam">Dipinjam</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse text-black">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-4 font-semibold">ID</th>
                    <th className="px-4 py-4 font-semibold">Nama Peminjam</th>
                    <th className="px-4 py-4 font-semibold">Kelas</th>
                    <th className="px-4 py-4 font-semibold">Jurusan</th>
                    <th className="px-4 py-4 font-semibold">Fasilitas</th>
                    <th className="px-4 py-4 font-semibold">Waktu Pinjam</th>
                    <th className="px-4 py-4 font-semibold">Waktu Selesai</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(row => (
                    <tr key={row.id_peminjaman} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.id_peminjaman}</td>
                      <td className="px-4 py-3 font-medium">{row.nama_peminjam}</td>
                      <td className="px-4 py-3">{row.kelas}</td>
                      <td className="px-4 py-3">{row.jurusan}</td>
                      <td className="px-4 py-3">{row.nama_barang}</td>
                      <td className="px-4 py-3 text-xs">{formatWaktu(row.tanggal_pengajuan)}</td>
                      <td className="px-4 py-3 text-xs">{formatWaktu(row.waktu_selesai)}</td>
                      <td className="px-4 py-3">
                        <span className={`${getStatusBadge(row.status)} px-3 py-1 rounded-full text-xs font-semibold border`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {row.status === 'Menunggu' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(row, 'Disetujui')}
                                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-all shadow-sm flex items-center gap-1"
                              >
                                <CheckCircle size={14} />
                                Terima
                              </button>
                              <button
                                onClick={() => handleStatusChange(row, 'Ditolak')}
                                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition-all shadow-sm flex items-center gap-1"
                              >
                                <XCircle size={14} />
                                Tolak
                              </button>
                            </>
                          )}
                          {row.status === 'Dipinjam' && (
                            <button
                              onClick={() => handleStatusChange(row, 'Selesai')}
                              className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-600 transition-all shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle size={14} />
                              Selesai
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPeminjaman(row)}
                            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600 transition-all shadow-sm flex items-center gap-1"
                          >
                            <Eye size={14} />
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-4">
                            <Clock size={32} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Tidak ada data peminjaman</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Detail */}
          {selectedPeminjaman && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedPeminjaman(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-3xl font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >×</button>

                <div className="space-y-4 text-gray-800">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-4 p-6 rounded-t-3xl">
                    <h2 className="text-2xl font-bold text-white text-center">
                      Detail Peminjaman #{selectedPeminjaman.id_peminjaman}
                    </h2>
                  </div>

                  {[ 
                    { label: 'Nama Peminjam', value: selectedPeminjaman.nama_peminjam },
                    { label: 'Kelas', value: selectedPeminjaman.kelas },
                    { label: 'Jurusan', value: selectedPeminjaman.jurusan },
                    { label: 'Fasilitas', value: selectedPeminjaman.nama_barang },
                    { label: 'Waktu Pinjam', value: formatWaktu(selectedPeminjaman.tanggal_pengajuan) },
                    { label: 'Waktu Selesai', value: formatWaktu(selectedPeminjaman.waktu_selesai) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block font-semibold mb-2 text-gray-700">{label}</label>
                      <input
                        type="text" value={value || ''} readOnly
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Keperluan</label>
                    <textarea
                      value={selectedPeminjaman.keperluan || ''} readOnly
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Status</label>
                    <select
                      value={editStatus || ''} 
                      onChange={e => handleStatusChange(selectedPeminjaman, e.target.value)}
                      disabled={updating}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all disabled:opacity-50"
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Dipinjam">Dipinjam</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>

                  {selectedPeminjaman.alasan_penolakan && (
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">Alasan Penolakan</label>
                      <textarea
                        value={selectedPeminjaman.alasan_penolakan || ''} readOnly
                        className="w-full border-2 border-red-200 rounded-xl px-4 py-2.5 bg-red-50 text-gray-700 resize-none"
                        rows={2}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedPeminjaman(null)}
                    className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
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
  return `${t.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} ${t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
}