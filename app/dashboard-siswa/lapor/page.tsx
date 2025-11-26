'use client'

import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Building2, MapPin, Package, FileText, Image as ImageIcon } from 'lucide-react'
import WhatsAppButton from '../../components/WhatsAppButton'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto">
        {/* Header Section - Modern */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4B7FF2] to-[#3a6ed8] rounded-2xl mb-4 shadow-lg shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-3xl -rotate-3 hover:rotate-0 transition-transform duration-300">🛠️</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Laporan Kerusakan
          </h1>
          <p className="text-gray-600">
            Laporkan kerusakan fasilitas agar bisa segera diperbaiki
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Card - Modern Design */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            {/* Form Header with Gradient */}
            <div className="bg-gradient-to-r from-[#4B7FF2] to-[#3a6ed8] p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Form Laporan</h2>
                  <p className="text-blue-100 text-sm">Isi data dengan lengkap</p>
                </div>
              </div>
            </div>

            <form onSubmit={submitLaporan} className="p-6 space-y-5">
              {/* Gedung & Ruangan - Grid Layout */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Gedung */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                    <Building2 size={16} className="text-[#4B7FF2]" />
                    Gedung
                  </label>
                  <select
                    name="gedung"
                    value={gedung}
                    onChange={(e) => setGedung(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#4B7FF2] focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all bg-gray-50 hover:bg-white"
                    required
                  >
                    <option value="">Pilih Gedung</option>
                    <option value="A">🏢 Gedung A</option>
                    <option value="B">🏢 Gedung B</option>
                  </select>
                </div>

                {/* Ruangan */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                    <MapPin size={16} className="text-[#4B7FF2]" />
                    Ruangan
                  </label>
                  <select
                    name="ruangan"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-[#4B7FF2] focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all bg-gray-50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={!gedung}
                  >
                    <option value="">
                      {gedung ? "Pilih Ruangan" : "Pilih gedung dulu"}
                    </option>
                    {(gedung === "A" ? ruanganGedungA : gedung === "B" ? ruanganGedungB : []).map((r) => (
                      <option key={r} value={r}>📍 {r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Barang */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <Package size={16} className="text-[#4B7FF2]" />
                  Nama Barang / Fasilitas
                </label>
                <input
                  type="text"
                  name="nama_barang"
                  placeholder="Contoh: Proyektor, Kipas Angin, Meja"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#4B7FF2] focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all bg-gray-50 hover:bg-white"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <FileText size={16} className="text-[#4B7FF2]" />
                  Deskripsi Kerusakan
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  placeholder="Jelaskan detail kerusakan yang terjadi..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[#4B7FF2] focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all resize-none bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              {/* Upload Foto */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <ImageIcon size={16} className="text-[#4B7FF2]" />
                  Upload Foto <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    name="foto"
                    accept="image/*"
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 text-gray-900 text-sm focus:border-[#4B7FF2] focus:ring-4 focus:ring-blue-50 focus:outline-none cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-[#4B7FF2] transition-all file:cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#4B7FF2] file:to-[#3a6ed8] file:text-white file:font-semibold file:text-sm file:shadow-md hover:file:shadow-lg file:transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#4B7FF2] to-[#3a6ed8] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-[#3a6ed8] hover:to-[#2952c7] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Mengirim Laporan...
                  </>
                ) : (
                  <>
                    <span className="group-hover:scale-110 transition-transform">📤</span>
                    Kirim Laporan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar - Info & WhatsApp */}
          <div className="lg:col-span-1 space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="font-bold text-lg mb-3">Tips Pelaporan</h3>
              <ul className="space-y-2 text-sm text-blue-50">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>Jelaskan kerusakan dengan detail dan jelas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>Upload foto untuk mempercepat penanganan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>Pastikan lokasi yang dilaporkan sudah benar</span>
                </li>
              </ul>
            </div>

            {/* WhatsApp Card */}
              <WhatsAppButton />
            </div>
          </div>
        </div>
      </div>
  )
}