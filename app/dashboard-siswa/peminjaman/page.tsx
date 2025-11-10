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

  // Ambil data user & fasilitas
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

  // Filter berdasarkan search
  useEffect(() => {
    const lower = search.toLowerCase()
    const hasil = fasilitas.filter(
      f =>
        f.nama_fasilitas.toLowerCase().includes(lower) ||
        f.deskripsi?.toLowerCase().includes(lower)
    )
    setFiltered(hasil)
  }, [search, fasilitas])

  // Tanggal range
  const minDate = new Date(tanggalPinjam)
  minDate.setDate(minDate.getDate() + 1)
  const maxDate = new Date(tanggalPinjam)
  maxDate.setDate(maxDate.getDate() + 7)
  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  // Pengajuan peminjaman normal
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

  // Request peminjaman custom (barang tidak ada di daftar)
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
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">
        Ajukan Peminjaman Fasilitas 🏫
      </h1>

      {/* Search & Request */}
      <div className="max-w-2xl mx-auto mb-8 flex flex-col md:flex-row gap-3 justify-between">
        <input
          type="text"
          placeholder="Cari fasilitas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-black focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
        <button
          onClick={() => setShowRequest(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-5 py-2 text-sm font-medium shadow"
        >
          Request Peminjaman
        </button>
      </div>

      {/* Grid Fasilitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {filtered.length > 0 ? (
          filtered.map(f => (
            <div
              key={f.id_fasilitas}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-3 flex flex-col"
            >
              <img
                src={f.gambar_url}
                alt={f.nama_fasilitas}
                className="rounded-lg w-full h-36 object-cover mb-3"
              />
              <h2 className="text-base font-semibold text-black mb-1">{f.nama_fasilitas}</h2>
              <p className="text-xs text-gray-600 mb-2">Tersedia: {f.jumlah_tersedia}</p>
              <p className="text-sm text-gray-500 line-clamp-2 flex-1">{f.deskripsi}</p>
              <button
                onClick={() => setSelected(f)}
                disabled={f.jumlah_tersedia === 0}
                className={`mt-3 py-2 rounded-lg text-white text-sm ${
                  f.jumlah_tersedia > 0 ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Ajukan
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">Tidak ada fasilitas ditemukan.</p>
        )}
      </div>

      {/* Modal Peminjaman */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-3 text-center text-indigo-700">Form Peminjaman</h2>
            <form onSubmit={ajukanPeminjaman} className="space-y-3">
              <p className="text-center font-semibold text-indigo-600">{selected.nama_fasilitas}</p>

              <div>
                <label className="text-sm font-medium text-black">Tanggal Pinjam</label>
                <input
                  type="date"
                  value={tanggalPinjam}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">Tanggal Kembali</label>
                <input
                  type="date"
                  min={formatDate(minDate)}
                  max={formatDate(maxDate)}
                  value={tanggalKembali}
                  onChange={e => setTanggalKembali(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400"
                />
                <p className="text-xs text-gray-500 mt-1">Maksimal 7 hari.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-black">Keperluan</label>
                <textarea
                  name="keperluan"
                  rows={2}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100 text-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600"
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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center text-indigo-700">Request Peminjaman</h2>
            <form onSubmit={handleRequestSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-black">Nama Barang</label>
                <input
                  name="nama_barang"
                  type="text"
                  placeholder="Contoh: Kabel HDMI"
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">Tanggal Pinjam</label>
                <input
                  type="date"
                  value={tanggalPinjam}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">Tanggal Kembali</label>
                <input
                  type="date"
                  min={formatDate(minDate)}
                  max={formatDate(maxDate)}
                  value={tanggalKembali}
                  onChange={e => setTanggalKembali(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400"
                />
                <p className="text-xs text-gray-500 mt-1">Maksimal 7 hari.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-black">Keperluan</label>
                <textarea
                  name="keperluan"
                  rows={2}
                  placeholder="Tuliskan alasan peminjaman..."
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequest(false)}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100 text-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <div className="mt-10 flex justify-center">
        <WhatsAppButton />
      </div>
    </div>
  )
}
