'use client'

import Sidebar from '../../components/Sidebar'
import SectionTable from '../../components/SectionTable'
import Footer from '../../components/Footer'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { useRouter } from 'next/navigation'
import { ClipboardList, Wrench, Clock, CheckCircle } from 'lucide-react'
import 'aos/dist/aos.css'

// Registrasi ChartJS
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function DashboardPage() {
  const router = useRouter()
  const [peminjaman, setPeminjaman] = useState<any[]>([])
  const [kerusakan, setKerusakan] = useState<any[]>([])
  const [statistik, setStatistik] = useState({
    totalPeminjaman: 0,
    fasilitasPerbaikan: 0,
    menungguPersetujuan: 0,
    laporanAktif: 0
  })
  const [namaUser, setNamaUser] = useState('')
  const [topFasilitas, setTopFasilitas] = useState<{ nama: string; total: number }[]>([])
  const [peminjamanBulanan, setPeminjamanBulanan] = useState<{ bulan: string; jumlah: number }[]>([])

  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({ duration: 800, once: true })
    })
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setNamaUser(parsed.nama)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPeminjaman, resKerusakan, resStatistik, resTop, resBulanan] =
          await Promise.all([
            fetch('/api/dashboard/peminjaman-mingguan'),
            fetch('/api/dashboard/kerusakan-mingguan'),
            fetch('/api/dashboard/statistik'),
            fetch('/api/dashboard/top-fasilitas'),
            fetch('/api/dashboard/peminjaman-bulanan')
          ])

        if (!resPeminjaman.ok || !resKerusakan.ok || !resStatistik.ok || !resTop.ok || !resBulanan.ok) {
          throw new Error('Gagal fetch salah satu data')
        }

        setPeminjaman(await resPeminjaman.json())
        setKerusakan(await resKerusakan.json())

        const stat = await resStatistik.json()
        setStatistik({
          totalPeminjaman: stat.totalPeminjaman || 0,
          fasilitasPerbaikan: stat.fasilitasPerbaikan || 0,
          menungguPersetujuan: stat.menungguPersetujuan || 0,
          laporanAktif: stat.laporanAktif || 0
        })

        setTopFasilitas(await resTop.json())
        setPeminjamanBulanan(await resBulanan.json())
      } catch (error) {
        console.error('Gagal ambil data:', error)
        const storedUser = localStorage.getItem('user')
        if (!storedUser) router.push('/login')
      }
    }

    fetchData()
  }, [router])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-black">
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-xl p-6 sm:p-8 text-white" data-aos="fade-down">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <span className="text-3xl">👋</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Selamat Datang, {namaUser || 'Admin'}!</h1>
                <p className="text-indigo-100 text-sm mt-1">Dashboard Admin SiFasBi</p>
              </div>
            </div>
          </div>

          {/* Statistik Ringkas */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <StatBox 
              title="Total Peminjaman" 
              value={statistik.totalPeminjaman}
              icon={<ClipboardList size={24} />}
              color="from-blue-500 to-indigo-600"
              bgColor="bg-blue-50"
            />
            <StatBox 
              title="Dalam Perbaikan" 
              value={statistik.fasilitasPerbaikan}
              icon={<Wrench size={24} />}
              color="from-orange-500 to-red-600"
              bgColor="bg-orange-50"
            />
            <StatBox 
              title="Menunggu Persetujuan" 
              value={statistik.menungguPersetujuan}
              icon={<Clock size={24} />}
              color="from-amber-500 to-yellow-600"
              bgColor="bg-amber-50"
            />
            <StatBox 
              title="Laporan Aktif" 
              value={statistik.laporanAktif}
              icon={<CheckCircle size={24} />}
              color="from-green-500 to-emerald-600"
              bgColor="bg-green-50"
            />
          </div>

          {/* Grafik */}
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Pie Chart */}
            <ChartCard title="Fasilitas Populer" icon="📊">
              <Pie
                data={{
                  labels: topFasilitas.map((item) => item.nama),
                  datasets: [
                    {
                      data: topFasilitas.map((item) => item.total),
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
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
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
                      cornerRadius: 8
                    }
                  }
                }}
              />
            </ChartCard>

            {/* Bar Chart */}
            <ChartCard title="Tren Peminjaman Bulanan" icon="📈">
              <Bar
                data={{
                  labels: peminjamanBulanan.map((item) => item.bulan),
                  datasets: [
                    {
                      label: 'Jumlah Peminjaman',
                      data: peminjamanBulanan.map((item) => item.jumlah),
                      backgroundColor: 'rgba(99, 102, 241, 0.8)',
                      borderColor: '#6366F1',
                      borderWidth: 2,
                      borderRadius: 8,
                      hoverBackgroundColor: '#6366F1'
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      cornerRadius: 8
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
                  }
                }}
              />
            </ChartCard>
          </div>

          {/* Tabel Peminjaman */}
          <div className="overflow-x-auto" data-aos="fade-up" data-aos-delay="300">
            <SectionTable
              title="Daftar Pengajuan Peminjaman Hari Ini"
              headers={['ID', 'Nama Peminjam', 'Fasilitas', 'Waktu Pinjam', 'Waktu Selesai', 'Status']}
              rows={peminjaman.map((p) => [
                p.id_peminjaman,
                p.nama_peminjam,
                p.fasilitas,
                formatWaktu(p.waktu_pinjam),
                formatWaktu(p.waktu_selesai),
                p.status
              ])}
              link="/ADMIN/peminjaman"
            />
          </div>

          {/* Tabel Kerusakan */}
          <div className="overflow-x-auto" data-aos="fade-up" data-aos-delay="400">
            <SectionTable
              title="Daftar Pelaporan Kerusakan Hari Ini"
              headers={['ID', 'Pelapor', 'Fasilitas', 'Waktu Lapor', 'Ruangan', 'Status']}
              rows={kerusakan.map((k) => [
                k.id_laporan,
                k.nama_siswa,
                k.fasilitas,
                formatWaktu(k.waktu_lapor),
                k.ruangan,
                k.status
              ])}
              link="/ADMIN/laporan-kerusakan"
            />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}

function StatBox({ 
  title, 
  value, 
  icon, 
  color, 
  bgColor 
}: { 
  title: string
  value: number
  icon: React.ReactNode
  color: string
  bgColor: string
}) {
  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-5 border border-gray-100 group"
      data-aos="fade-up"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${bgColor} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300`}>
          <div className={`bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
            {icon}
          </div>
        </div>
        <div className={`bg-gradient-to-br ${color} rounded-lg px-3 py-1`}>
          <p className="text-white font-bold text-2xl">{value ?? 0}</p>
        </div>
      </div>
      <p className="text-gray-700 font-semibold text-sm">{title}</p>
    </div>
  )
}

function ChartCard({ 
  title, 
  icon, 
  children 
}: { 
  title: string
  icon: string
  children: React.ReactNode 
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2.5">
          <span className="text-white text-xl">{icon}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="h-[300px]">{children}</div>
    </div>
  )
}

function formatWaktu(waktu: string) {
  const t = new Date(waktu)
  return `${t.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })}, ${t.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })} WIB`
}