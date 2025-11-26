'use client'

import { useEffect, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import WhatsAppButton from '../../components/WhatsAppButton'

export default function PengajuanPeminjamanPage() {
  const [fasilitas, setFasilitas] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [tanggalPinjam, setTanggalPinjam] = useState<string>('')
  const [tanggalKembali, setTanggalKembali] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showRequest, setShowRequest] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('users')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser?.nis) setUser(parsedUser)
      else toast.error('Data pengguna tidak valid. Silakan login ulang.')
    }

    fetch('/api/siswa/fasilitas')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFasilitas(data)
          setFiltered(data)
        }
      })
      .catch(() => toast.error('Gagal mengambil data fasilitas.'))

    const today = new Date().toISOString().split('T')[0]
    setTanggalPinjam(today)
  }, [])

  useEffect(() => {
    const lower = search.toLowerCase()
    const hasil = fasilitas.filter(
      f =>
        f.nama_fasilitas.toLowerCase().includes(lower) ||
        f.deskripsi?.toLowerCase().includes(lower)
    )
    setFiltered(hasil)
  }, [search, fasilitas])

  const minDate = new Date(tanggalPinjam)
  minDate.setDate(minDate.getDate() + 1)
  const maxDate = new Date(tanggalPinjam)
  maxDate.setDate(maxDate.getDate() + 7)
  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  const ajukanPeminjaman = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selected) return toast.error('Pilih fasilitas terlebih dahulu.')
    if (!user?.nis) return toast.error('Data pengguna tidak ditemukan.')
    if (!tanggalKembali) return toast.error('Pilih tanggal pengembalian.')

    const formData = new FormData(e.currentTarget)
    const keperluan = formData.get('keperluan') as string

    try {
      const res = await fetch('/api/siswa/peminjaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user: user.nis,
          kode_inventaris: selected.kode_inventaris,
          waktu_mulai: tanggalPinjam,
          waktu_selesai: tanggalKembali,
          keperluan,
          status: 'Dipinjam',
          nama_peminjam: user.nama,
          nama_barang: selected.nama_fasilitas,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')

      toast.success('Peminjaman berhasil diajukan!')
      setSelected(null)
      setTanggalKembali('')
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengajukan peminjaman.')
    }
  }

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.nis) return toast.error('Data pengguna tidak ditemukan.')

    const formData = new FormData(e.currentTarget)
    const namaBarang = formData.get('nama_barang') as string
    const keperluan = formData.get('keperluan') as string

    if (!namaBarang.trim()) return toast.error('Isi nama barang.')
    if (!tanggalKembali) return toast.error('Pilih tanggal pengembalian.')

    try {
      const res = await fetch('/api/siswa/req-peminjaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user: user.nis,
          nama_peminjam: user.nama,
          nama_barang: namaBarang,
          waktu_mulai: tanggalPinjam,
          waktu_selesai: tanggalKembali,
          keperluan,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')

      toast.success('Request peminjaman berhasil dikirim!')
      setShowRequest(false)
      e.currentTarget.reset()
      setTanggalKembali('')
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim request peminjaman.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full p-4 mb-4">
            <span className="text-4xl">🏫</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3">
            Ajukan Peminjaman Fasilitas
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pilih fasilitas yang ingin dipinjam atau ajukan request untuk barang yang tidak tersedia
          </p>
        </div>

        {/* Search & Request Button */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari fasilitas yang kamu butuhkan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Grid Fasilitas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {filtered.length > 0 ? (
            filtered.map(f => (
              <div
                key={f.id_fasilitas}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={f.gambar_url}
                    alt={f.nama_fasilitas}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-sm font-bold text-indigo-600">
                      {f.jumlah_tersedia > 0 ? `${f.jumlah_tersedia} Unit` : 'Habis'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {f.nama_fasilitas}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[40px]">
                    {f.deskripsi || 'Tidak ada deskripsi'}
                  </p>
                  
                  <button
                    onClick={() => setSelected(f)}
                    disabled={f.jumlah_tersedia === 0}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
                      f.jumlah_tersedia > 0
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {f.jumlah_tersedia > 0 ? '📋 Ajukan Pinjam' : '❌ Tidak Tersedia'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 font-medium text-lg">Tidak ada fasilitas ditemukan</p>
              <p className="text-gray-400 text-sm mt-2">Coba gunakan kata kunci lain atau ajukan request</p>
            </div>
          )}
        </div>

        {/* WhatsApp Button */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 inline-block">
            <p className="text-gray-600 text-sm mb-3 text-center font-medium flex items-center gap-2 justify-center">
              <span className="text-xl">💬</span>
              Butuh bantuan? Hubungi kami
            </p>
            <WhatsAppButton />
          </div>
        </div>
      </div>

      {/* Modal Peminjaman */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl my-8 border border-gray-100 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-3xl p-6 text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-3 mb-3">
                <span className="text-3xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Form Peminjaman</h2>
              <p className="text-indigo-100 text-sm">Lengkapi data peminjaman di bawah ini</p>
            </div>
            
            <form onSubmit={ajukanPeminjaman} className="p-6 space-y-5">
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 text-center">
                <p className="text-sm text-indigo-600 font-medium mb-1">Fasilitas yang dipilih:</p>
                <p className="font-bold text-lg text-indigo-800">{selected.nama_fasilitas}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Tanggal Pinjam
                </label>
                <input
                  type="date"
                  value={tanggalPinjam}
                  readOnly
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Tanggal Kembali
                </label>
                <input
                  type="date"
                  min={formatDate(minDate)}
                  max={formatDate(maxDate)}
                  value={tanggalKembali}
                  onChange={e => setTanggalKembali(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span>⏱️</span>
                  Maksimal peminjaman 7 hari
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✍️ Keperluan
                </label>
                <textarea
                  name="keperluan"
                  rows={3}
                  required
                  placeholder="Jelaskan untuk apa fasilitas ini akan digunakan..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Request Peminjaman */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl my-8 border border-gray-100 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-3xl p-6 text-center">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-3 mb-3">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Request Peminjaman</h2>
              <p className="text-purple-100 text-sm">Ajukan request untuk barang yang tidak tersedia</p>
            </div>
            
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📦 Nama Barang
                </label>
                <input
                  name="nama_barang"
                  type="text"
                  placeholder="Contoh: Kabel HDMI 10 meter"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Tanggal Pinjam
                </label>
                <input
                  type="date"
                  value={tanggalPinjam}
                  readOnly
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Tanggal Kembali
                </label>
                <input
                  type="date"
                  min={formatDate(minDate)}
                  max={formatDate(maxDate)}
                  value={tanggalKembali}
                  onChange={e => setTanggalKembali(e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span>⏱️</span>
                  Maksimal peminjaman 7 hari
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✍️ Keperluan
                </label>
                <textarea
                  name="keperluan"
                  rows={3}
                  placeholder="Jelaskan untuk apa barang ini akan digunakan..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequest(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Kirim Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}