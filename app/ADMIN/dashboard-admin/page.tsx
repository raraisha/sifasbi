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
import 'aos/dist/aos.css'

// Registrasi elemen Chart.js
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
    laporanAktif: 0,
  })
  const [namaUser, setNamaUser] = useState('')
  const [topFasilitas, setTopFasilitas] = useState<{ nama: string; total: number }[]>([])
  const [peminjamanBulanan, setPeminjamanBulanan] = useState<{ bulan: string; jumlah: number }[]>([])

  // Lazy load AOS
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({ duration: 800, once: true })
    })
  }, [])

  // Ambil nama user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setNamaUser(parsed.nama)
    }
  }, [])

  // Fetch data dashboard
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
          throw new Error('Salah satu fetch gagal')
        }

        setPeminjaman(await resPeminjaman.json())
        setKerusakan(await resKerusakan.json())
        setStatistik(await resStatistik.json())
        setTopFasilitas(await resTop.json())
        setPeminjamanBulanan(await resBulanan.json())
      } catch (error) {
        console.error('Gagal ambil data:', error)
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          router.push('/login')
        }
      }
    }

    fetchData()
  }, [router])

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8FD] text-black">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar jadi collapse di mobile */}
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-8">
          <h1 className="text-lg sm:text-2xl font-semibold" data-aos="fade-right">
            Selamat Datang, {namaUser}!
          </h1>

          {/* Statistik Ringkas */}
          <div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <StatBox title="Total Pengajuan Peminjaman" value={statistik.totalPeminjaman} />
            <StatBox title="Fasilitas dalam Perbaikan" value={statistik.fasilitasPerbaikan} />
            <StatBox title="Menunggu Persetujuan" value={statistik.menungguPersetujuan} />
            <StatBox title="Laporan Kerusakan Aktif" value={statistik.laporanAktif} />
          </div>

          {/* Grafik */}
          <div
            className="flex flex-col gap-4 lg:flex-row"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Pie Chart */}
            <div className="bg-white p-4 rounded-lg shadow h-[300px] flex-1 min-w-[280px]">
              <h2 className="text-sm sm:text-lg font-semibold mb-4">
                Fasilitas yang Paling Sering Dipinjam
              </h2>
              <div className="h-[220px]">
                <Pie
                  data={{
                    labels: topFasilitas.map((item) => item.nama),
                    datasets: [
                      {
                        data: topFasilitas.map((item) => item.total),
                        backgroundColor: ['#a78bfa', '#7c3aed', '#6d28d9', '#5b21b6']
                      }
                    ]
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white p-4 rounded-lg shadow h-[300px] flex-1 min-w-[280px]">
              <h2 className="text-sm sm:text-lg font-semibold mb-4">
                Jumlah Peminjaman / Bulan
              </h2>
              <div className="h-[220px]">
                <Bar
                  data={{
                    labels: peminjamanBulanan.map((item) => item.bulan),
                    datasets: [
                      {
                        label: 'Jumlah Peminjaman',
                        data: peminjamanBulanan.map((item) => item.jumlah),
                        backgroundColor: '#7c3aed'
                      }
                    ]
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tabel Pengajuan */}
          <div className="overflow-x-auto">
            <SectionTable
              title="Daftar Pengajuan Peminjaman Hari Ini"
              headers={['ID', 'Nama Peminjam', 'Fasilitas', 'Waktu Pinjam', 'Waktu Selesai', 'Status']}
              rows={peminjaman.map((p: any) => [
                p.id_peminjaman,
                p.nama_peminjam,
                p.fasilitas,
                formatWaktu(p.waktu_pinjam),
                formatWaktu(p.waktu_selesai),
                p.status,
              ])}
              link="/ADMIN/peminjaman"
            />
          </div>

          {/* Tabel Kerusakan */}
          <div className="overflow-x-auto">
            <SectionTable
              title="Daftar Pelaporan Kerusakan Hari Ini"
              headers={['ID', 'Pelapor', 'Fasilitas', 'Waktu Lapor', 'Ruangan', 'Status']}
              rows={kerusakan.map((k: any) => [
                k.id_laporan,
                k.pelapor,
                k.fasilitas,
                formatWaktu(k.waktu_lapor),
                k.ruangan,
                k.status,
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

function StatBox({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow text-center" data-aos="fade-up">
      <div className="text-lg sm:text-2xl font-bold">{value}</div>
      <div className="text-xs sm:text-sm text-gray-600">{title}</div>
    </div>
  )
}

function formatWaktu(waktu: string) {
  const t = new Date(waktu)
  return `${t.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })} ${t.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })} WIB`
}
