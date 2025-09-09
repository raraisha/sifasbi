'use client'

import { useState } from 'react'

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
    const formData = new FormData(e.currentTarget)

    // ambil dari localStorage (user login)
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    formData.append("id_siswa", user.nis)

    const res = await fetch("/api/siswa/laporan/kerusakan", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      alert("Laporan berhasil dikirim ✅")
      e.currentTarget.reset()
      setGedung("")
    } else {
      alert("Gagal kirim laporan ❌")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Form Laporan Kerusakan 🛠️
        </h1>
        <form onSubmit={submitLaporan} className="space-y-5">
          {/* Gedung */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Gedung</label>
            <select
              name="gedung"
              value={gedung}
              onChange={(e) => setGedung(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              <option value="">-- Pilih Gedung --</option>
              <option value="A">Gedung A</option>
              <option value="B">Gedung B</option>
            </select>
          </div>

          {/* Ruangan */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Ruangan</label>
            <select
              name="ruangan"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              <option value="">-- Pilih Ruangan --</option>
              {gedung === "A" &&
                ruanganGedungA.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              {gedung === "B" &&
                ruanganGedungB.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
            </select>
          </div>

          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Nama Barang</label>
            <input
              type="text"
              name="nama_barang"
              placeholder="Contoh: Proyektor"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Deskripsi</label>
            <textarea
              name="deskripsi"
              rows={3}
              placeholder="Tuliskan detail kerusakan..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Upload Foto (Opsional)</label>
            <input
              type="file"
              name="foto"
              accept="image/*"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </form>
      </div>
    </div>
  )
}
