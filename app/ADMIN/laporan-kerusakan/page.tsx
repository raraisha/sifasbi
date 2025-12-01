'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function LaporanKerusakanPage() {
  const router = useRouter()
  const [dataKerusakan, setDataKerusakan] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [namaUser, setNamaUser] = useState('')
  const [selectedLaporan, setSelectedLaporan] = useState<any | null>(null)
  const [editStatus, setEditStatus] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setNamaUser(JSON.parse(storedUser).nama)
  }, [])

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

  useEffect(() => { fetchData() }, [router])

  useEffect(() => {
    if (selectedLaporan) setEditStatus(selectedLaporan.status)
  }, [selectedLaporan])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/dashboard/laporan-kerusakan')
        if (!res.ok) return
        const latestData = await res.json()
        if (latestData.length > dataKerusakan.length) toast.success('Ada laporan baru masuk!')
        setDataKerusakan(latestData)
      } catch (err) { console.error(err) }
    }, 5000)
    return () => clearInterval(interval)
  }, [dataKerusakan])

  const handleStatusChange = async (laporan: any, newStatus: string) => {
    let alasan = ''
    if (newStatus === 'Ditolak') {
      alasan = prompt('Masukkan alasan penolakan:') || ''
      if (!alasan.trim()) {
        toast.error('Alasan penolakan wajib diisi!')
        return
      }
    }

    setSelectedLaporan(laporan)
    setEditStatus(newStatus)
    setUpdating(true)
    try {
      const res = await fetch(`/api/dashboard/laporan-kerusakan/${laporan.id_pelaporan}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, alasan }),
      })
      if (!res.ok) throw new Error('Gagal update status')

      setDataKerusakan(prev =>
        prev.map(item =>
          item.id_pelaporan === laporan.id_pelaporan
            ? { ...item, status: newStatus, alasan_penolakan: alasan }
            : item
        )
      )
      setSelectedLaporan(prev => prev && { ...prev, status: newStatus, alasan_penolakan: alasan })
      toast.success('Status berhasil diperbarui!')

      try {
        await fetch('/api/siswa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: laporan.email || 'example@email.com',
            subject: `Status Laporan Kerusakan: ${newStatus}`,
            message: `Halo ${laporan.nama_siswa}, status laporan kerusakan fasilitas "${laporan.nama_barang}" di ${laporan.ruangan} sudah diubah menjadi ${newStatus}.`
          })
        })
        toast.success('Email notifikasi berhasil dikirim!')
      } catch (err) {
        console.error(err)
        toast.error('Gagal mengirim email notifikasi.')
      }

    } catch (err) {
      console.error(err)
      toast.error('Gagal update status, coba lagi ya.')
      setEditStatus(laporan.status)
    } finally {
      setUpdating(false)
    }
  }

  const filteredData = dataKerusakan
    .filter(item =>
      (item.id_siswa?.toLowerCase().includes(search.toLowerCase()) ||
       item.nama_siswa?.toLowerCase().includes(search.toLowerCase()))
    )
    .filter(item => (filter ? item.status === filter : true))

  const tanggalSekarang = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      'Menunggu': 'bg-amber-100 text-amber-800 border-amber-300',
      'Diproses': 'bg-blue-100 text-blue-800 border-blue-300',
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
              <h1 className="text-2xl font-bold text-white">Kelola Laporan Kerusakan</h1>
              <p className="text-indigo-100 text-sm mt-1">Pantau dan kelola laporan kerusakan fasilitas</p>
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
                placeholder="Cari ID atau Nama Siswa..."
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
                <option value="Diproses">Diproses</option>
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
                    <th className="px-4 py-4 font-semibold">NIS</th>
                    <th className="px-4 py-4 font-semibold">Nama Siswa</th>
                    <th className="px-4 py-4 font-semibold">Kelas</th>
                    <th className="px-4 py-4 font-semibold">Jurusan</th>
                    <th className="px-4 py-4 font-semibold">Nama Barang</th>
                    <th className="px-4 py-4 font-semibold">Waktu Lapor</th>
                    <th className="px-4 py-4 font-semibold">Ruangan</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(row => (
                    <tr key={row.id_pelaporan} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.id_pelaporan}</td>
                      <td className="px-4 py-3">{row.id_siswa}</td>
                      <td className="px-4 py-3 font-medium">{row.nama_siswa}</td>
                      <td className="px-4 py-3">{row.kelas}</td>
                      <td className="px-4 py-3">{row.jurusan}</td>
                      <td className="px-4 py-3">{row.nama_barang}</td>
                      <td className="px-4 py-3 text-xs">{formatWaktu(row.waktu_dibuat)}</td>
                      <td className="px-4 py-3">{row.ruangan}</td>
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
                                onClick={() => handleStatusChange(row, 'Diproses')}
                                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-all shadow-sm flex items-center gap-1"
                              >
                                <CheckCircle size={14} />
                                Proses
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
                          {row.status === 'Diproses' && (
                            <button
                              onClick={() => handleStatusChange(row, 'Selesai')}
                              className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-600 transition-all shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle size={14} />
                              Selesai
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedLaporan(row)}
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
                      <td colSpan={10} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-4">
                            <Clock size={32} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Tidak ada data laporan</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Detail */}
          {selectedLaporan && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-4xl shadow-2xl relative flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedLaporan(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-3xl font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >×</button>

                {selectedLaporan.url_gambar && (
                  <div className="md:w-80 flex-shrink-0">
                    <img
                      src={selectedLaporan.url_gambar}
                      alt="Foto Kerusakan"
                      className="w-full h-80 object-cover rounded-2xl border-2 border-gray-200 shadow-lg"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-4 text-gray-800">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-4 p-6 rounded-t-3xl">
                    <h2 className="text-2xl font-bold text-white text-center">
                      Detail Laporan #{selectedLaporan.id_pelaporan}
                    </h2>
                  </div>

                  {[ 
                    { label: 'NIS Pelapor', value: selectedLaporan.id_siswa },
                    { label: 'Nama Siswa', value: selectedLaporan.nama_siswa },
                    { label: 'Nama Barang', value: selectedLaporan.nama_barang },
                    { label: 'Gedung', value: selectedLaporan.gedung },
                    { label: 'Ruangan', value: selectedLaporan.ruangan },
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
                    <label className="block font-semibold mb-2 text-gray-700">Deskripsi</label>
                    <textarea
                      value={selectedLaporan.deskripsi || ''} readOnly
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">Status</label>
                    <select
                      value={editStatus || ''} 
                      onChange={e => handleStatusChange(selectedLaporan, e.target.value)}
                      disabled={updating}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all disabled:opacity-50"
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>

                  {selectedLaporan.alasan_penolakan && (
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">Alasan Penolakan</label>
                      <textarea
                        value={selectedLaporan.alasan_penolakan || ''} readOnly
                        className="w-full border-2 border-red-200 rounded-xl px-4 py-2.5 bg-red-50 text-gray-700 resize-none"
                        rows={2}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedLaporan(null)}
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
  const t = new Date(waktu)
  return `${t.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} ${t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
}