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
        // Pastikan semua nilai numerik
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
    <div className="flex flex-col min-h-screen bg-[#F9F8FD] text-black">
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 space-y-10">
          <h1 className="text-2xl font-semibold mb-4" data-aos="fade-right">
            Selamat Datang, {namaUser || 'User'}!
          </h1>

          {/* Statistik Ringkas */}
          <div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Pie Chart */}
            <ChartCard title="Fasilitas yang Paling Sering Dipinjam">
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
            </ChartCard>

            {/* Bar Chart */}
            <ChartCard title="Jumlah Peminjaman / Bulan">
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
            </ChartCard>
          </div>

          {/* Tabel Peminjaman */}
          <div className="overflow-x-auto">
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
          <div className="overflow-x-auto">
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

function StatBox({ title, value }: { title: string; value: number }) {
  return (
    <div
      className="bg-white p-5 rounded-xl shadow-md text-center flex flex-col justify-center"
      data-aos="fade-up"
    >
      <div className="text-2xl font-bold text-indigo-600">
        {value ?? 0}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md h-[320px] flex flex-col justify-between">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="flex-1">{children}</div>
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
