'use client'

import { useEffect, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import WhatsAppButton from '../../components/WhatsAppButton'

export default function PengajuanPeminjamanPage() {
  const [fasilitas, setFasilitas] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [tanggalPinjam, setTanggalPinjam] = useState<string>('')
  const [tanggalKembali, setTanggalKembali] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)

  // Ambil data user & fasilitas
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('users')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser?.nis) {
          setUser(parsedUser)
        } else {
          toast.error('Data pengguna tidak valid. Silakan login ulang.')
        }
      } else {
        toast.error('Data pengguna tidak ditemukan.')
      }
    } catch (err) {
      console.error('Gagal baca data user:', err)
      toast.error('Gagal membaca data pengguna.')
    }

    // Ambil data fasilitas
    fetch('/api/siswa/fasilitas')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFasilitas(data)
      })
      .catch(() => toast.error('Gagal mengambil data fasilitas.'))

    const today = new Date().toISOString().split('T')[0]
    setTanggalPinjam(today)
  }, [])

  // Range tanggal kembali (H+1 s.d H+7)
  const minDate = new Date(tanggalPinjam)
  minDate.setDate(minDate.getDate() + 1)
  const maxDate = new Date(tanggalPinjam)
  maxDate.setDate(maxDate.getDate() + 7)
  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  // Fungsi pengajuan peminjaman
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
          nis: user.nis,
          kode_inventaris: selected.kode_inventaris,
          tanggal_pinjam: tanggalPinjam,
          waktu_selesai: tanggalKembali,
          keperluan,
          status: 'Dipinjam',
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

  // Konfirmasi batal
  const handleBatal = () => setShowConfirm(true)
  const handleConfirmYes = () => {
    setShowConfirm(false)
    setSelected(null)
    setTanggalKembali('')
    toast.success('Peminjaman dibatalkan.')
  }
  const handleConfirmNo = () => setShowConfirm(false)

  return (
    <div className="px-6 py-8">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-extrabold mb-8 text-center text-black">
        Ajukan Peminjaman Fasilitas 🏫
      </h1>

      {/* List Fasilitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fasilitas.map(f => (
          <div
            key={f.id_fasilitas}
            className="bg-white rounded-xl shadow-md p-4 transition hover:scale-105"
          >
            <img
              src={f.gambar_url}
              alt={f.nama_fasilitas}
              className="rounded-lg w-full h-44 object-cover mb-3"
            />
            <h2 className="text-lg font-semibold text-black">{f.nama_fasilitas}</h2>
            <p className="text-sm text-gray-700">
              Jumlah tersedia: {f.jumlah_tersedia}
            </p>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {f.deskripsi}
            </p>
            <button
              onClick={() => setSelected(f)}
              disabled={f.jumlah_tersedia === 0}
              className={`mt-4 w-full px-4 py-2 rounded-lg text-white text-sm ${
                f.jumlah_tersedia > 0
                  ? 'bg-indigo-500 hover:bg-indigo-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Ajukan
            </button>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 relative">
            <h2 className="text-xl font-bold mb-4 text-center text-black">
              Form Peminjaman
            </h2>

            <form onSubmit={ajukanPeminjaman} className="space-y-4">
              <p className="text-center font-semibold text-indigo-600 mb-3">
                {selected.nama_fasilitas}
              </p>

              {/* Tanggal Pinjam */}
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Tanggal Pinjam
                </label>
                <input
                  type="date"
                  name="tanggal_pinjam"
                  value={tanggalPinjam}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Tanggal Kembali */}
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Tanggal Kembali
                </label>
                <input
                  type="date"
                  name="tanggal_kembali"
                  min={formatDate(minDate)}
                  max={formatDate(maxDate)}
                  value={tanggalKembali}
                  onChange={e => setTanggalKembali(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bisa pinjam maksimal 7 hari.
                </p>
              </div>

              {/* Keperluan */}
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Keperluan
                </label>
                <textarea
                  name="keperluan"
                  rows={2}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBatal}
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

      {/* Modal Konfirmasi Batal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-72 text-center">
            <p className="text-lg font-semibold mb-5 text-black">
              Yakin mau batalin?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleConfirmYes}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Ya
              </button>
              <button
                onClick={handleConfirmNo}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <div className="mt-8 flex justify-center">
        <WhatsAppButton />
      </div>
    </div>
  )
}
