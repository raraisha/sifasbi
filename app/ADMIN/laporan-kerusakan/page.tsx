'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'

export default function LaporanKerusakanPage() {
  const router = useRouter()
  const [dataKerusakan, setDataKerusakan] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [namaUser, setNamaUser] = useState('')
  const [selectedLaporan, setSelectedLaporan] = useState<any | null>(null)
  const [editStatus, setEditStatus] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Ambil nama user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setNamaUser(JSON.parse(storedUser).nama)
  }, [])

  // Fetch data laporan
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

  // Auto-refresh setiap 5 detik
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

  // Handle status change & kirim email
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

      // Update local state
      setDataKerusakan(prev =>
        prev.map(item =>
          item.id_pelaporan === laporan.id_pelaporan
            ? { ...item, status: newStatus, alasan_penolakan: alasan }
            : item
        )
      )
      setSelectedLaporan(prev => prev && { ...prev, status: newStatus, alasan_penolakan: alasan })
      toast.success('Status berhasil diperbarui!')

      // Kirim email notifikasi
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8FD] text-black">
      <Toaster position="top-right" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="bg-white shadow px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <h1 className="text-lg font-semibold">Kelola Laporan Kerusakan</h1>
            <span className="text-sm text-gray-500">{tanggalSekarang}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Cari ID atau Nama Siswa..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <select
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
              value={filter} onChange={e => setFilter(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse text-black">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">NIS</th>
                  <th className="px-4 py-2">Nama Siswa</th>
                  <th className="px-4 py-2">Kelas</th>
                  <th className="px-4 py-2">Jurusan</th>
                  <th className="px-4 py-2">Nama Barang</th>
                  <th className="px-4 py-2">Waktu Lapor</th>
                  <th className="px-4 py-2">Ruangan</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(row => (
                  <tr key={row.id_pelaporan} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{row.id_pelaporan}</td>
                    <td className="px-4 py-2">{row.id_siswa}</td>
                    <td className="px-4 py-2">{row.nama_siswa}</td>
                    <td className="px-4 py-2">{row.kelas}</td>
                    <td className="px-4 py-2">{row.jurusan}</td>
                    <td className="px-4 py-2">{row.nama_barang}</td>
                    <td className="px-4 py-2">{formatWaktu(row.waktu_dibuat)}</td>
                    <td className="px-4 py-2">{row.ruangan}</td>
                    <td className="px-4 py-2">{row.status}</td>
                    <td className="px-4 py-2 flex gap-2">
                      {row.status === 'Menunggu' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(row, 'Diproses')}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                          >Proses</button>
                          <button
                            onClick={() => handleStatusChange(row, 'Ditolak')}
                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                          >Tolak</button>
                        </>
                      )}
                      {row.status === 'Diproses' && (
                        <button
                          onClick={() => handleStatusChange(row, 'Selesai')}
                          className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                        >Selesai</button>
                      )}
                      <button
                        onClick={() => setSelectedLaporan(row)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:brightness-110"
                      >Detail</button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-500">Tidak ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Detail */}
          {selectedLaporan && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-[700px] shadow-2xl relative flex gap-6">
                <button
                  onClick={() => setSelectedLaporan(null)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                >×</button>

                {selectedLaporan.url_gambar && (
                  <img
                    src={selectedLaporan.url_gambar}
                    alt="Foto Kerusakan"
                    className="w-60 h-60 object-cover rounded-lg border border-gray-300 shadow-sm"
                  />
                )}

                <div className="flex-1 space-y-3 text-gray-800">
                  <h2 className="text-lg font-extrabold mb-2 text-gray-900 text-center">
                    Detail Laporan ID {selectedLaporan.id_pelaporan}
                  </h2>

                  {[ 
                    { label: 'NIS Pelapor', value: selectedLaporan.id_siswa },
                    { label: 'Nama Siswa', value: selectedLaporan.nama_siswa },
                    { label: 'Nama Barang', value: selectedLaporan.nama_barang },
                    { label: 'Gedung', value: selectedLaporan.gedung },
                    { label: 'Ruangan', value: selectedLaporan.ruangan },
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
                    <label className="block font-semibold mb-1">Deskripsi</label>
                    <textarea
                      value={selectedLaporan.deskripsi || ''} readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={editStatus || ''} onChange={e => handleStatusChange(selectedLaporan, e.target.value)}
                      disabled={updating}
                      className="w-full border rounded px-3 py-1"
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>

                  {selectedLaporan.alasan_penolakan && (
                    <div>
                      <label className="block font-semibold mb-1">Alasan Penolakan</label>
                      <textarea
                        value={selectedLaporan.alasan_penolakan || ''} readOnly
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700"
                        rows={2}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedLaporan(null)}
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
  const t = new Date(waktu)
  return `${t.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} ${t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
}
