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
import { ClipboardList, Wrench, Clock, CheckCircle, Sparkles, TrendingUp, Activity } from 'lucide-react'
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
  const [pelaporan_kerusakan, setKerusakan] = useState<any[]>([])
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row relative z-10">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Enhanced Header with Gradient Animation */}
          <div 
            className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden group" 
            data-aos="fade-down"
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating orbs */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
            
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    Selamat Datang, {namaUser || 'Admin'}!
                  </h1>
                  <p className="text-indigo-100 text-sm mt-1 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Dashboard Admin SiFasBi - Monitoring Real-time
                  </p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                <p className="text-xs text-indigo-100">Tanggal Hari Ini</p>
                <p className="font-semibold">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid with Glassmorphism */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <StatBox 
              title="Total Peminjaman" 
              value={statistik.totalPeminjaman}
              icon={<ClipboardList size={26} />}
              color="from-blue-500 via-blue-600 to-indigo-700"
              bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              accentColor="blue"
            />
            <StatBox 
              title="Dalam Perbaikan" 
              value={statistik.fasilitasPerbaikan}
              icon={<Wrench size={26} />}
              color="from-orange-500 via-red-500 to-red-700"
              bgColor="bg-gradient-to-br from-orange-50 to-red-100"
              accentColor="orange"
            />
            <StatBox 
              title="Menunggu Persetujuan" 
              value={statistik.menungguPersetujuan}
              icon={<Clock size={26} />}
              color="from-amber-500 via-yellow-500 to-yellow-700"
              bgColor="bg-gradient-to-br from-amber-50 to-yellow-100"
              accentColor="yellow"
            />
            <StatBox 
              title="Laporan Aktif" 
              value={statistik.laporanAktif}
              icon={<CheckCircle size={26} />}
              color="from-green-500 via-emerald-500 to-teal-700"
              bgColor="bg-gradient-to-br from-green-50 to-emerald-100"
              accentColor="green"
            />
          </div>

          {/* Enhanced Charts Section */}
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Pie Chart with Glow Effect */}
            <ChartCard title="Fasilitas Populer" icon="📊" gradient="from-purple-500 to-pink-600">
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
                      borderWidth: 4,
                      borderColor: '#fff',
                      hoverOffset: 15,
                      hoverBorderWidth: 5
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        font: { size: 13, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#374151'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      padding: 16,
                      cornerRadius: 12,
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 },
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1
                    }
                  }
                }}
              />
            </ChartCard>

            {/* Bar Chart with Gradient */}
            <ChartCard title="Tren Peminjaman Bulanan" icon="📈" gradient="from-indigo-500 to-blue-600">
              <Bar
                data={{
                  labels: peminjamanBulanan.map((item) => item.bulan),
                  datasets: [
                    {
                      label: 'Jumlah Peminjaman',
                      data: peminjamanBulanan.map((item) => item.jumlah),
                      backgroundColor: 'rgba(99, 102, 241, 0.9)',
                      borderColor: '#6366F1',
                      borderWidth: 0,
                      borderRadius: 12,
                      hoverBackgroundColor: '#4F46E5',
                      barThickness: 40
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      padding: 16,
                      cornerRadius: 12,
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 },
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(99, 102, 241, 0.1)',
                        drawBorder: false
                      },
                      ticks: {
                        font: { size: 12, weight: '600' },
                        color: '#6B7280',
                        padding: 10
                      }
                    },
                    x: {
                      grid: { display: false },
                      ticks: {
                        font: { size: 12, weight: '600' },
                        color: '#6B7280',
                        padding: 10
                      }
                    }
                  }
                }}
              />
            </ChartCard>
          </div>

          {/* Enhanced Tables Section */}
          <div className="overflow-x-auto" data-aos="fade-up" data-aos-delay="300">
            <SectionTable
              title="Daftar Pengajuan Peminjaman Minggu Ini"
              headers={['ID', 'Nama Peminjam', 'Fasilitas', 'Waktu Pinjam', 'Waktu Selesai', 'Status']}
              rows={peminjaman.map((p) => [
                p.id_peminjaman,
                p.nama_peminjam,
                p.nama_barang,
                formatWaktu(p.tanggal_pengajuan),
                formatWaktu(p.waktu_selesai),
                p.status
              ])}
              link="/ADMIN/peminjaman"
            />
          </div>

          <div className="overflow-x-auto" data-aos="fade-up" data-aos-delay="400">
            <SectionTable
              title="Daftar Pelaporan Kerusakan Minggu Ini"
              headers={['ID', 'Nama', 'Fasilitas', 'Waktu Lapor', 'Ruangan', 'Status']}
              rows={pelaporan_kerusakan.map((k) => [
                k.id_pelaporan,
                k.nama_siswa,
                k.nama_barang,
                formatWaktu(k.waktu_dibuat),
                k.ruangan,
                k.status
              ])}
              link="/ADMIN/laporan-kerusakan"
            />
          </div>
        </main>
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

function StatBox({ 
  title, 
  value, 
  icon, 
  color, 
  bgColor,
  accentColor 
}: { 
  title: string
  value: number
  icon: React.ReactNode
  color: string
  bgColor: string
  accentColor: string
}) {
  return (
    <div
      className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-6 border border-white/40 group overflow-hidden"
      data-aos="fade-up"
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
      
      {/* Animated corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-20 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500`}></div>
      
      <div className="relative flex items-start justify-between mb-4">
        <div className={`${bgColor} rounded-2xl p-4 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          <div className={`bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
            {icon}
          </div>
        </div>
        <div className={`bg-gradient-to-br ${color} rounded-xl px-4 py-2 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
          <p className="text-white font-bold text-3xl">{value ?? 0}</p>
        </div>
      </div>
      
      <div className="relative">
        <p className="text-gray-700 font-bold text-sm">{title}</p>
        <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${color} rounded-full transition-all duration-500 mt-2`}></div>
      </div>
    </div>
  )
}

function ChartCard({ 
  title, 
  icon, 
  gradient,
  children 
}: { 
  title: string
  icon: string
  gradient: string
  children: React.ReactNode 
}) {
  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 p-6 border border-white/50 group overflow-hidden">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
      
      {/* Corner decoration */}
      <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${gradient} opacity-5 rounded-tl-full transform translate-x-16 translate-y-16 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700`}></div>
      
      <div className="relative flex items-center gap-3 mb-6">
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-3 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
          <span className="text-white text-2xl">{icon}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500 font-medium">Data Terkini</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-[300px]">{children}</div>
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