'use client'

import { useEffect, useState } from 'react'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js'
import WhatsAppButton from '../../components/WhatsAppButton'

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
      .catch(() => setAktivitas(null))

    fetch(`/api/siswa/fasilitas/stats?nis=${parsed.nis}`)
      .then(res => res.json())
      .then(setFasilitas)
      .catch(() => setFasilitas([]))

    fetch(`/api/siswa/bulanan?nis=${parsed.nis}`)
      .then(res => res.json())
      .then(setPeminjamanBulanan)
      .catch(() => setPeminjamanBulanan([]))
  }, [])

  if (!user || !aktivitas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header dengan gradient background */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <span className="text-3xl">👋</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">Hai, {user.nama}!</h1>
              <p className="text-indigo-100 text-sm sm:text-base mt-1">
                Selamat datang di dashboard peminjamanmu
              </p>
            </div>
          </div>
        </div>

        {/* Ringkasan Aktivitas dengan design card modern */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatBox 
            title="Total Peminjaman" 
            value={aktivitas.totalPeminjaman} 
            color="from-indigo-500 to-indigo-600"
            icon="📚"
            lightColor="bg-indigo-50"
          />
          <StatBox 
            title="Peminjaman Aktif" 
            value={aktivitas.peminjamanAktif} 
            color="from-yellow-500 to-orange-500"
            icon="⏳"
            lightColor="bg-yellow-50"
          />
          <StatBox 
            title="Bulan Ini" 
            value={aktivitas.peminjamanBulanIni} 
            color="from-green-500 to-emerald-600"
            icon="📅"
            lightColor="bg-green-50"
          />
          <StatBox 
            title="Laporan Kerusakan" 
            value={aktivitas.laporanKerusakan} 
            color="from-red-500 to-pink-600"
            icon="⚠️"
            lightColor="bg-red-50"
          />
        </div>

        {/* Charts dengan shadow dan spacing lebih baik */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-2.5">
                <span className="text-white text-xl">📊</span>
              </div>
              <h2 className="font-bold text-xl text-gray-800">
                Fasilitas Favoritmu
              </h2>
            </div>
            <div className="w-full h-[320px] flex justify-center items-center">
              {fasilitas.length > 0 ? (
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
                          '#10B981'
                        ],
                        borderWidth: 3,
                        borderColor: '#fff',
                        hoverOffset: 10
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: { 
                      duration: 800,
                      easing: 'easeInOutQuart'
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: { size: 12, weight: '500' },
                          usePointStyle: true,
                          pointStyle: 'circle'
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-500 font-medium">Belum ada data peminjaman</p>
                  <p className="text-gray-400 text-sm mt-2">Mulai pinjam fasilitas untuk melihat statistik</p>
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5">
                <span className="text-white text-xl">📈</span>
              </div>
              <h2 className="font-bold text-xl text-gray-800">
                Tren Peminjaman
              </h2>
            </div>
            <div className="w-full h-[320px]">
              <Bar
                data={{
                  labels: peminjamanBulanan.map(p => p.bulan),
                  datasets: [
                    {
                      data: peminjamanBulanan.map(p => p.jumlah),
                      backgroundColor: 'rgba(99, 102, 241, 0.8)',
                      borderColor: '#6366F1',
                      borderWidth: 2,
                      borderRadius: 8,
                      hoverBackgroundColor: '#6366F1',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 800,
                    easing: 'easeInOutQuart'
                  },
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      cornerRadius: 8,
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 }
                    }
                  },
                  scales: { 
                    y: { 
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                      },
                      ticks: {
                        font: { size: 12, weight: '500' },
                        color: '#6B7280'
                      }
                    },
                    x: {
                      grid: { display: false },
                      ticks: {
                        font: { size: 12, weight: '500' },
                        color: '#6B7280'
                      }
                    }
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Tombol WhatsApp dengan design menarik */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 inline-block">
            <p className="text-gray-600 text-sm mb-3 text-center font-medium">
              Butuh bantuan? Hubungi kami
            </p>
            <WhatsAppButton />
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
  icon,
  lightColor 
}: { 
  title: string
  value: number
  color: string
  icon: string
  lightColor: string
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 border border-gray-100 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`${lightColor} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className={`bg-gradient-to-br ${color} rounded-lg px-3 py-1`}>
          <p className="text-white font-bold text-2xl">{value}</p>
        </div>
      </div>
      <p className="text-gray-700 font-semibold text-sm sm:text-base">{title}</p>
    </div>
  )
}