'use client'

import { useEffect, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import WhatsAppButton from '../../components/WhatsAppButton'

export default function PengajuanPeminjamanPage() {
  const [fasilitas, setFasilitas] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [users, setUser] = useState<any>(null)
  const [minTanggalPengajuan, setMinTanggalPengajuan] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('users')
    if (storedUser) setUser(JSON.parse(storedUser))

    fetch('/api/siswa/fasilitas')
      .then(res => res.json())
      .then(setFasilitas)

    const today = new Date().toISOString().split('T')[0]
    setMinTanggalPengajuan(today)
  }, [])

  const ajukanPeminjaman = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const tanggal_pengajuan = formData.get('tanggal_pengajuan') as string
    const waktu_pengembalian = formData.get('waktu_pengembalian') as string
    const keperluan = formData.get('keperluan') as string

    const res = await fetch('/api/siswa/peminjaman', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nis: users?.nis,
        kode_inventaris: selected.kode_inventaris,
        tanggal_pengajuan,
        waktu_pengembalian,
        keperluan,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      toast.success('Peminjaman berhasil diajukan!')
      setSelected(null)
    } else {
      toast.error(data.error || 'Terjadi kesalahan, coba lagi.')
    }
  }

  const handleOutsideClick = (e: any) => {
    if (e.target.id === 'modal-overlay') setShowConfirm(true)
  }

  const handleBatal = () => {
    setShowConfirm(true)
  }

  const handleConfirmYes = () => {
    setShowConfirm(false)
    setSelected(null)
    toast.success('Dibatalkan')
  }

  const handleConfirmNo = () => {
    setShowConfirm(false)
  }

  return (
    <div className="px-6 py-8">
      <Toaster position="top-center" />

      <h1 className="text-3xl font-extrabold mb-8 text-black text-center">
        Ajukan Peminjaman Fasilitas 🏫
      </h1>

      {/* List fasilitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {fasilitas.map(f => (
          <div
            key={f.id_fasilitas}
            className="bg-white rounded-2xl shadow-md p-5 transition transform hover:scale-105 hover:shadow-xl"
          >
            <div className="aspect-square w-full">
              <img
                src={f.gambar_url}
                alt={f.nama_fasilitas}
                className="rounded-xl h-full w-full object-cover"
              />
            </div>

            <h2 className="text-lg font-semibold text-black">{f.nama_fasilitas}</h2>
            <p className="text-sm text-black mt-1">
              Jumlah Tersedia: <span className="font-medium">{f.jumlah_tersedia}</span>
            </p>
            <p className="text-sm text-gray-700 mt-2 line-clamp-3">{f.deskripsi}</p>
            <button
              onClick={() => setSelected(f)}
              className={`mt-4 w-full px-4 py-2 rounded-lg text-white font-medium transition ${
                f.jumlah_tersedia > 0
                  ? 'bg-indigo-500 hover:bg-indigo-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={f.jumlah_tersedia === 0}
            >
              Ajukan Peminjaman
            </button>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {selected && (
        <div
          id="modal-overlay"
          onClick={handleOutsideClick}
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        >
          <div
            className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-6 text-center text-black">
              Form Peminjaman
            </h2>

            <form onSubmit={ajukanPeminjaman} className="space-y-4">
              <p className="text-center font-semibold text-indigo-600 mb-4">
                {selected.nama_fasilitas}
              </p>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Tanggal Pengajuan
                </label>
                <input
                  type="date"
                  name="tanggal_pengajuan"
                  min={minTanggalPengajuan}
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Waktu Pengembalian
                </label>
                <input
                  type="datetime-local"
                  name="waktu_pengembalian"
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Keperluan
                </label>
                <textarea
                  name="keperluan"
                  className="w-full border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  rows={2}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBatal}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100 transition text-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition"
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
            <div className="mt-8 flex justify-center">
        <WhatsAppButton />
      </div>
    </div>
  )
}
