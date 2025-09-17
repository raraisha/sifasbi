'use client'

import { useEffect, useState } from 'react'

export default function PeminjamanPage() {
  const [fasilitas, setFasilitas] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))

    fetch('/api/siswa/fasilitas')
      .then(res => res.json())
      .then(setFasilitas)
  }, [])

  const ajukanPeminjaman = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const res = await fetch('/api/peminjaman', {
      method: 'POST',
      body: JSON.stringify({
        id_siswa: user?.nis,
        id_fasilitas: selected.id_fasilitas,
        tanggal_pinjam: formData.get('tanggal_pinjam'),
        tanggal_kembali: formData.get('tanggal_kembali'),
        alasan: formData.get('alasan'),
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      alert('Peminjaman berhasil diajukan!')
      setSelected(null)
    }
  }

  const handleOutsideClick = (e: any) => {
    if (e.target.id === 'modal-overlay') {
      if (confirm('Yakin mau batalin?')) {
        setSelected(null)
      }
    }
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-extrabold mb-8 text-black text-center">
        Pinjam Fasilitas Yuk! 🏫
      </h1>

      {/* Card List */}
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
            onClick={e => e.stopPropagation()} // biar klik dalam card gak nutup
          >
            <h2 className="text-xl font-bold mb-6 text-center text-black">
              Ajukan Peminjaman
            </h2>
            <form onSubmit={ajukanPeminjaman} className="space-y-4">
              <p className="text-center font-semibold text-indigo-600 mb-4">
                {selected.nama_fasilitas}
              </p>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Tanggal Pinjam</label>
                <input
                  type="date"
                  name="tanggal_pinjam"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Tanggal Kembali</label>
                <input
                  type="date"
                  name="tanggal_kembali"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Alasan</label>
                <textarea
                  name="alasan"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  rows={2}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Yakin mau batalin?')) setSelected(null)
                  }}
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
    </div>
  )
}
