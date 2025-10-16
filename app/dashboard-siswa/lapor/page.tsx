'use client'

import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Building2, MapPin, Package, FileText, Image as ImageIcon } from 'lucide-react'

interface UserData {
  id_siswa?: string
  nis?: string
  id?: string
  nama?: string
}

export default function LaporanKerusakanPage() {
  const [loading, setLoading] = useState(false)
  const [gedung, setGedung] = useState("")

  const ruanganGedungA = [
    "A1","A2","A3","A4","A5","A6","A7","A8","A9","A10","A11",
    "Toilet Perempuan Lantai 1","Toilet Perempuan Lantai 2",
    "Toilet Laki-Laki Lantai 1","Toilet Laki-Laki Lantai 2",
    "Kantin","Perpustakaan","UKS","Lobby","PSB","SG","TU","BK",
    "Toilet Guru","Ruangan Depkur 1","Ruangan Depkur 2",
    "Ruangan Pak Rizam","Ruangan Kepala Sekolah",
    "Ruang Guru","Aula","Tefa"
  ]

  const ruanganGedungB = [
    "Lab Animasi","Lab BC","Lab Editing","Ruang BiChannel",
    "Studio","B.04","Lab TIK","Lab TKJ","Lab RPL",
    "Toilet Perempuan","Toilet Laki-Laki"
  ]

  const submitLaporan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    const storedUser = localStorage.getItem("user")
    const users: UserData = storedUser ? JSON.parse(storedUser) : {}

    const id_siswa = users.id_siswa || users.nis || users.id

    if (!id_siswa) {
      toast.error("ID siswa tidak ditemukan. Pastikan sudah login.")
      setLoading(false)
      return
    }

    formData.append("id_siswa", id_siswa)

    try {
      const res = await fetch("/api/siswa/laporan/kerusakan", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        toast.success("Laporan berhasil dikirim ✅")
        form.reset()
        setGedung("")
      } else {
        const errorText = await res.text()
        console.error("Gagal kirim laporan:", errorText)
        toast.error("Gagal kirim laporan ❌")
      }
    } catch (err) {
      console.error("Error:", err)
      toast.error("Terjadi kesalahan jaringan ❌")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md shadow-2xl border border-indigo-100 p-8 rounded-3xl transition-all hover:shadow-indigo-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-700 mb-2 tracking-tight">
            Laporan Kerusakan 🛠️
          </h1>
          <p className="text-gray-500 text-sm">
            Isi data dengan lengkap agar laporan bisa diproses cepat
          </p>
        </div>

        <form onSubmit={submitLaporan} className="space-y-6">
          {/* Gedung */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Gedung</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
              <select
                name="gedung"
                value={gedung}
                onChange={(e) => setGedung(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-10 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              >
                <option value="">-- Pilih Gedung --</option>
                <option value="A">Gedung A</option>
                <option value="B">Gedung B</option>
              </select>
            </div>
          </div>

          {/* Ruangan */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Ruangan</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <select
                name="ruangan"
                className="w-full border border-gray-300 rounded-xl pl-10 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              >
                <option value="">-- Pilih Ruangan --</option>
                {(gedung === "A" ? ruanganGedungA : gedung === "B" ? ruanganGedungB : []).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nama Barang */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Nama Barang</label>
            <div className="relative">
              <Package className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                name="nama_barang"
                placeholder="Contoh: Proyektor"
                className="w-full border border-gray-300 rounded-xl pl-10 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Deskripsi</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea
                name="deskripsi"
                rows={3}
                placeholder="Tuliskan detail kerusakan..."
                className="w-full border border-gray-300 rounded-xl pl-10 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Upload Foto */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Upload Foto (Opsional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="file"
                name="foto"
                accept="image/*"
                className="w-full border border-gray-300 rounded-xl pl-10 px-3 py-2 text-gray-900 focus:outline-none cursor-pointer file:cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700 file:font-medium hover:file:bg-indigo-200"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </form>
      </div>
    </div>
  )
}
