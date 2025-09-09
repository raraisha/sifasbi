'use client'

import { useEffect, useState } from 'react'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale)

export default function DashboardSiswa() {
  const [aktivitas, setAktivitas] = useState<any>(null)
  const [fasilitas, setFasilitas] = useState<any[]>([])
  const [peminjamanBulanan, setPeminjamanBulanan] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return
    const parsed = JSON.parse(storedUser)
    setUser(parsed)

    // fetch data khusus user
    fetch(`/api/siswa/aktivitas?nis=${parsed.nis}`)
      .then(res => res.json())
      .then(setAktivitas)

    fetch(`/api/siswa/fasilitas?nis=${parsed.nis}`)
      .then(res => res.json())
      .then(setFasilitas)

    fetch(`/api/siswa/bulanan?nis=${parsed.nis}`)
      .then(res => res.json())
      .then(setPeminjamanBulanan)
  }, [])

  if (!user || !aktivitas) return <p>Loading...</p>

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hai, {user.nama}! 👋</h1>
        <p className="text-gray-500">Selamat datang di dashboard peminjamanmu.</p>
      </div>

      {/* Ringkasan Aktivitas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatBox title="Total Peminjaman" value={aktivitas.totalPeminjaman} color="text-indigo-600" />
        <StatBox title="Peminjaman Aktif" value={aktivitas.peminjamanAktif} color="text-yellow-500" />
        <StatBox title="Bulan Ini" value={aktivitas.peminjamanBulanIni} color="text-green-600" />
        <StatBox title="Laporan Kerusakan" value={aktivitas.laporanKerusakan} color="text-red-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4 text-gray-800">Fasilitas yang Sering Kamu Pinjam</h2>
          <Pie
            data={{
              labels: fasilitas.map(f => f.nama_fasilitas),
              datasets: [
                {
                  data: fasilitas.map(f => f.jumlah),
                  backgroundColor: ['#8B5CF6','#6366F1','#EC4899','#F59E0B','#10B981'],
                },
              ],
            }}
          />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-lg mb-4 text-gray-800">Jumlah Peminjaman / Bulan</h2>
          <Bar
            data={{
              labels: peminjamanBulanan.map(p => p.bulan),
              datasets: [
                {
                  data: peminjamanBulanan.map(p => p.jumlah),
                  backgroundColor: '#6366F1',
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

function StatBox({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <p className={`text-3xl font-bold mb-2 ${color}`}>{value}</p>
      <p className="text-gray-600">{title}</p>
    </div>
  )
}
