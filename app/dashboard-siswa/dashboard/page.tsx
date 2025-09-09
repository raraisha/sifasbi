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

  if (!user || !aktivitas) {
    return <p className="p-6 text-center text-gray-500">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Hai, {user.nama}! 👋</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Selamat datang di dashboard peminjamanmu.
        </p>
      </div>

      {/* Ringkasan Aktivitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <StatBox
          title="Total Peminjaman"
          value={aktivitas.totalPeminjaman}
          color="text-indigo-600"
        />
        <StatBox
          title="Peminjaman Aktif"
          value={aktivitas.peminjamanAktif}
          color="text-yellow-500"
        />
        <StatBox
          title="Bulan Ini"
          value={aktivitas.peminjamanBulanIni}
          color="text-green-600"
        />
        <StatBox
          title="Laporan Kerusakan"
          value={aktivitas.laporanKerusakan}
          color="text-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 overflow-x-auto">
          <h2 className="font-semibold text-base sm:text-lg mb-4 text-gray-800">
            Fasilitas yang Sering Kamu Pinjam
          </h2>
          <div className="w-full max-w-[400px] mx-auto">
            <Pie
              data={{
                labels: fasilitas.map(f => f.nama_fasilitas),
                datasets: [
                  {
                    data: fasilitas.map(f => f.jumlah),
                    backgroundColor: [
                      '#8B5CF6',
                      '#6366F1',
                      '#EC4899',
                      '#F59E0B',
                      '#10B981',
                    ],
                  },
                ],
              }}
            />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 overflow-x-auto">
          <h2 className="font-semibold text-base sm:text-lg mb-4 text-gray-800">
            Jumlah Peminjaman / Bulan
          </h2>
          <div className="w-full min-w-[280px]">
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
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center">
      <p className={`text-2xl sm:text-3xl font-bold mb-2 ${color}`}>{value}</p>
      <p className="text-gray-600 text-sm sm:text-base">{title}</p>
    </div>
  )
}
