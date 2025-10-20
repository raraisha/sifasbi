'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Wrench, Clock } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import WhatsAppButton from '../../components/WhatsAppButton'

interface UserData {
  nis?: string
  id_siswa?: string
  id?: string
}

interface Peminjaman {
  id: number
  fasilitas: string
  tanggal_pinjam: string
  tanggal_kembali: string
  status: string
  alasan: string
}

interface Laporan {
  id: number
  gedung: string
  ruangan: string
  nama_barang: string
  deskripsi: string
  created_at: string
  status?: string
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'peminjaman' | 'laporan'>('peminjaman')
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([])
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [loading, setLoading] = useState(true)

  // Fungsi untuk format tanggal agar gak error meski format beda
  const formatTanggal = (value?: string) => {
    if (!value) return '-'
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
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const storedUser = localStorage.getItem('user')
      const user: UserData = storedUser ? JSON.parse(storedUser) : {}
      const id_siswa = user.id_siswa || user.nis || user.id

      if (!id_siswa) {
        toast.error('ID siswa tidak ditemukan. Pastikan sudah login.')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/siswa/history?id_siswa=${id_siswa}`)
        const data = await res.json()

        if (res.ok) {
          setPeminjaman(data.peminjaman || [])
          setLaporan(data.kerusakan || [])
        } else {
          toast.error('Gagal memuat data.')
        }
      } catch (err) {
        console.error(err)
        toast.error('Terjadi kesalahan jaringan.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const tabButton = (label: string, value: 'peminjaman' | 'laporan', icon: JSX.Element) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all ${
        activeTab === value
          ? 'bg-indigo-600 text-white shadow-lg scale-105'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Riwayat Aktivitas</h1>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          {tabButton('Peminjaman', 'peminjaman', <ClipboardList size={18} />)}
          {tabButton('Laporan Kerusakan', 'laporan', <Wrench size={18} />)}
        </div>

        {/* Konten */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Memuat data...</p>
        ) : (
          <div className="space-y-4">
            {activeTab === 'peminjaman' ? (
              peminjaman.length > 0 ? (
                peminjaman.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 border rounded-xl bg-gradient-to-br from-indigo-50 to-white shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-900">{p.fasilitas}</p>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          p.status === 'disetujui'
                            ? 'bg-green-100 text-green-700'
                            : p.status === 'ditolak'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock size={14} /> {formatTanggal(p.tanggal_pinjam)} →{' '}
                      {formatTanggal(p.tanggal_kembali)}
                    </div>
                    <p className="text-sm text-gray-600 italic">Alasan: {p.alasan || '-'}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">
                  Belum ada riwayat peminjaman.
                </p>
              )
            ) : laporan.length > 0 ? (
              laporan.map((l) => (
                <div
                  key={l.id}
                  className="p-5 border rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-900">{l.nama_barang}</p>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        l.status === 'selesai'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {l.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    {l.gedung} • {l.ruangan}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} /> {formatTanggal(l.created_at)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 italic">{l.deskripsi}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">
                Belum ada laporan kerusakan.
              </p>
            )}
          </div>
        )}
      </div>
            <div className="mt-8 flex justify-center">
        <WhatsAppButton />
      </div>
    </div>
  )
}
