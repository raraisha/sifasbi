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

  const getStatusBgColor = (status: string) => {
    if (status === 'disetujui' || status === 'selesai') return 'bg-green-50'
    if (status === 'ditolak') return 'bg-red-50'
    return 'bg-amber-50'
  }

  const getStatusBadgeColor = (status: string) => {
    if (status === 'disetujui' || status === 'selesai') return 'bg-green-100 text-green-800'
    if (status === 'ditolak') return 'bg-red-100 text-red-800'
    return 'bg-amber-100 text-amber-800'
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
    <div className="min-h-screen bg-white p-6">
      <Toaster position="top-center" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Riwayat Aktivitas</h1>
          <p className="text-gray-500">Kelola riwayat peminjaman dan laporan kerusakan Anda</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('peminjaman')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'peminjaman'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <ClipboardList size={20} />
            Peminjaman
            <span className="ml-2 bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {peminjaman.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'laporan'
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Wrench size={20} />
            Laporan Kerusakan
            <span className="ml-2 bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {laporan.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mb-4"></div>
            </div>
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'peminjaman' ? (
              <div>
                {peminjaman.length > 0 ? (
                  <div className="space-y-4">
                    {peminjaman.map((p) => {
                      const borderColors = {
                        'disetujui': 'border-green-300 bg-green-50',
                        'ditolak': 'border-red-300 bg-red-50',
                        'pending': 'border-blue-300 bg-blue-50'
                      }
                      const borderColor = borderColors[p.status as keyof typeof borderColors] || 'border-blue-300 bg-blue-50'
                      
                      return (
                      <div
                        key={p.id}
                        className={`${borderColor} border-2 rounded-xl p-5 hover:shadow-md transition-all`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {getStatusIcon(p.status)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{p.nama_barang}</h3>
                              <p className="text-sm text-gray-600 mt-1">Keperluan: {p.keperluan || '-'}</p>
                            </div>
                          </div>
                          <span className={`${getStatusBadgeColor(p.status)} text-xs font-semibold px-3 py-1 rounded-full ml-3 whitespace-nowrap`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 ml-8">
                          <Clock size={16} className="text-gray-400" />
                          <span>{formatTanggal(p.tanggal_pinjam)}</span>
                          <span className="text-gray-400">→</span>
                          <span>{formatTanggal(p.tanggal_kembali)}</span>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Belum ada riwayat peminjaman</p>
                    <p className="text-gray-400 text-sm mt-1">Mulai ajukan peminjaman fasilitas sekarang</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {laporan.length > 0 ? (
                  <div className="space-y-4">
                    {laporan.map((l) => {
                      const borderColors = {
                        'selesai': 'border-green-300 bg-green-50',
                        'pending': 'border-purple-300 bg-purple-50'
                      }
                      const borderColor = borderColors[l.status as keyof typeof borderColors] || 'border-purple-300 bg-purple-50'
                      
                      return (
                      <div
                        key={l.id}
                        className={`${borderColor} border-2 rounded-xl p-5 hover:shadow-md transition-all`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {getStatusIcon(l.status || 'pending')}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{l.nama_barang}</h3>
                              <p className="text-sm text-gray-600 mt-1">{l.gedung} • {l.ruangan}</p>
                              <p className="text-sm text-gray-700 mt-2">{l.deskripsi}</p>
                            </div>
                          </div>
                          <span className={`${getStatusBadgeColor(l.status || 'pending')} text-xs font-semibold px-3 py-1 rounded-full ml-3 whitespace-nowrap`}>
                            {l.status || 'pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 ml-8">
                          <Clock size={16} className="text-gray-400" />
                          <span>{formatTanggal(l.waktu_dibuat)}</span>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Belum ada laporan kerusakan</p>
                    <p className="text-gray-400 text-sm mt-1">Semoga fasilitas selalu dalam kondisi baik</p>
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