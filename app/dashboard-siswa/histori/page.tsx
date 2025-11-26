'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Wrench, Clock, CheckCircle, XCircle, Clock4 } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

interface UserData {
  nis?: string
  id_siswa?: string
  id?: string
}

interface Peminjaman {
  id: number
  nama_barang: string
  tanggal_pinjam: string
  tanggal_kembali: string
  status: string
  keperluan: string
}

interface Laporan {
  id: number
  gedung: string
  ruangan: string
  nama_barang: string
  deskripsi: string
  waktu_dibuat: string
  status?: string
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'peminjaman' | 'laporan'>('peminjaman')
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([])
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [loading, setLoading] = useState(true)

  const formatTanggal = (value?: string) => {
    if (!value) return '-'
    try {
      const fixedValue = value.includes('T') ? value : value.replace(' ', 'T')
      const date = new Date(fixedValue)
      if (isNaN(date.getTime())) return 'Tanggal tidak valid'
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Error format'
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'disetujui' || status === 'selesai') return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === 'ditolak') return <XCircle className="w-5 h-5 text-red-600" />
    return <Clock4 className="w-5 h-5 text-amber-600" />
  }

  const getStatusBadgeColor = (status: string) => {
    if (status === 'disetujui' || status === 'selesai') return 'bg-green-100 text-green-800 border border-green-300'
    if (status === 'ditolak') return 'bg-red-100 text-red-800 border border-red-300'
    return 'bg-amber-100 text-amber-800 border border-amber-300'
  }

  const getCardStyle = (status: string) => {
    if (status === 'disetujui' || status === 'selesai') return 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white'
    if (status === 'ditolak') return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white'
    return 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white'
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const storedUser = localStorage.getItem('user')
        const user: UserData = storedUser ? JSON.parse(storedUser) : {}
        const id_siswa = user.id_siswa || user.nis || user.id

        if (!id_siswa) {
          toast.error('ID siswa tidak ditemukan. Pastikan sudah login.')
          setLoading(false)
          return
        }

        const res = await fetch(`/api/siswa/history?id_siswa=${id_siswa}`)
        const data = await res.json()

        if (res.ok) {
          setPeminjaman(Array.isArray(data.peminjaman) ? data.peminjaman : [])
          setLaporan(Array.isArray(data.kerusakan) ? data.kerusakan : [])
        } else {
          toast.error(data.message || 'Gagal memuat data.')
        }
      } catch (err) {
        console.error('Fetch error:', err)
        toast.error('Terjadi kesalahan jaringan.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <Toaster position="top-center" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Riwayat Aktivitas</h1>
          <p className="text-gray-600">Kelola riwayat peminjaman dan laporan kerusakan Anda</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-2 mb-8 border border-gray-100 flex gap-2">
          <button
            onClick={() => setActiveTab('peminjaman')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
              activeTab === 'peminjaman'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ClipboardList size={20} />
            <span className="hidden sm:inline">Peminjaman</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'peminjaman' ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-700'
            }`}>
              {peminjaman.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
              activeTab === 'laporan'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Wrench size={20} />
            <span className="hidden sm:inline">Laporan Kerusakan</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'laporan' ? 'bg-white/30 text-white' : 'bg-purple-100 text-purple-700'
            }`}>
              {laporan.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            </div>
            <p className="text-gray-600 font-medium">Memuat data...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'peminjaman' ? (
              <div>
                {peminjaman.length > 0 ? (
                  <div className="space-y-4">
                    {peminjaman.map((p) => (
                      <div
                        key={p.id}
                        className={`${getCardStyle(p.status)} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="bg-white rounded-xl p-3 shadow-sm">
                              {getStatusIcon(p.status)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-1">{p.nama_barang}</h3>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Keperluan:</span> {p.keperluan || '-'}
                              </p>
                            </div>
                          </div>
                          <span className={`${getStatusBadgeColor(p.status)} text-xs font-bold px-3 py-1.5 rounded-full ml-3 whitespace-nowrap`}>
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-white/50 rounded-xl p-3 ml-16">
                          <Clock size={16} className="text-gray-400" />
                          <span className="font-medium">{formatTanggal(p.tanggal_pinjam)}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">{formatTanggal(p.tanggal_kembali)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
                      <ClipboardList size={40} className="text-indigo-600" />
                    </div>
                    <p className="text-gray-700 text-lg font-semibold mb-2">Belum ada riwayat peminjaman</p>
                    <p className="text-gray-500 text-sm">Mulai ajukan peminjaman fasilitas sekarang</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {laporan.length > 0 ? (
                  <div className="space-y-4">
                    {laporan.map((l) => (
                      <div
                        key={l.id}
                        className={`${getCardStyle(l.status || 'pending')} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="bg-white rounded-xl p-3 shadow-sm">
                              {getStatusIcon(l.status || 'pending')}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-1">{l.nama_barang}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Lokasi:</span> {l.gedung} • {l.ruangan}
                              </p>
                              <p className="text-sm text-gray-700 bg-white/50 rounded-lg p-3">{l.deskripsi}</p>
                            </div>
                          </div>
                          <span className={`${getStatusBadgeColor(l.status || 'pending')} text-xs font-bold px-3 py-1.5 rounded-full ml-3 whitespace-nowrap`}>
                            {(l.status || 'pending').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-white/50 rounded-xl p-3 ml-16">
                          <Clock size={16} className="text-gray-400" />
                          <span className="font-medium">{formatTanggal(l.waktu_dibuat)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4">
                      <Wrench size={40} className="text-purple-600" />
                    </div>
                    <p className="text-gray-700 text-lg font-semibold mb-2">Belum ada laporan kerusakan</p>
                    <p className="text-gray-500 text-sm">Semoga fasilitas selalu dalam kondisi baik</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}