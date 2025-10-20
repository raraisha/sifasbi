'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useMemo, useState } from 'react'
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
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale)

function monthList() {
  return [
    { v: '01', n: 'Januari' },
    { v: '02', n: 'Februari' },
    { v: '03', n: 'Maret' },
    { v: '04', n: 'April' },
    { v: '05', n: 'Mei' },
    { v: '06', n: 'Juni' },
    { v: '07', n: 'Juli' },
    { v: '08', n: 'Agustus' },
    { v: '09', n: 'September' },
    { v: '10', n: 'Oktober' },
    { v: '11', n: 'November' },
    { v: '12', n: 'Desember' },
  ]
}

export default function LaporanStatistikPage() {
  const now = new Date()
  const thisMonth = String(now.getMonth() + 1).padStart(2, '0')
  const thisYear = String(now.getFullYear())

  const [bulanPeminjaman, setBulanPeminjaman] = useState(thisMonth)
  const [tahunPeminjaman, setTahunPeminjaman] = useState(thisYear)
  const [bulanPelaporan, setBulanPelaporan] = useState(thisMonth)
  const [tahunPelaporan, setTahunPelaporan] = useState(thisYear)
  const [statPeminjaman, setStatPeminjaman] = useState<any | null>(null)
  const [statPelaporan, setStatPelaporan] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPeminjaman = async (bulan: string, tahun: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/statistik/peminjaman?bulan=${tahun}-${bulan}`)
      const json = await res.json()
      setStatPeminjaman(json)
    } catch {
      setStatPeminjaman(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchPelaporan = async (bulan: string, tahun: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/statistik/pelaporan?bulan=${tahun}-${bulan}`)
      const json = await res.json()
      setStatPelaporan(json)
    } catch {
      setStatPelaporan(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeminjaman(thisMonth, thisYear)
    fetchPelaporan(thisMonth, thisYear)
  }, [])

  useEffect(() => {
    fetchPeminjaman(bulanPeminjaman, tahunPeminjaman)
  }, [bulanPeminjaman, tahunPeminjaman])

  useEffect(() => {
    fetchPelaporan(bulanPelaporan, tahunPelaporan)
  }, [bulanPelaporan, tahunPelaporan])

  const years = useMemo(() => {
    const y = []
    const current = new Date().getFullYear()
    for (let i = current; i >= current - 5; i--) y.push(String(i))
    return y
  }, [])

  const peminjamanLabels = (statPeminjaman?.byItem || []).map((r: any) => r.nama)
  const peminjamanValues = (statPeminjaman?.byItem || []).map((r: any) => r.jumlah)
  const pelaporanLabels = (statPelaporan?.byType || []).map((r: any) => r.type)
  const pelaporanValues = (statPelaporan?.byType || []).map((r: any) => r.count)

  const exportPDF = async (elementId: string, filename = 'laporan.pdf') => {
    const el = document.getElementById(elementId)
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('landscape', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(filename)
  }

  const exportExcel = (tableData: any[], sheetName: string, filename = 'laporan.xlsx') => {
    const ws = XLSX.utils.json_to_sheet(tableData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFD] text-gray-800">
      <Sidebar />
      <main className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">Laporan & Statistik</h1>
          <p className="text-sm text-gray-500">Pilih bulan dan ekspor data dengan mudah.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Statistik Peminjaman */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">Statistik Peminjaman</h2>
              <div className="flex gap-2">
                <select className="border rounded-lg px-3 py-1.5 text-sm" value={bulanPeminjaman} onChange={(e) => setBulanPeminjaman(e.target.value)}>
                  {monthList().map((m) => (
                    <option key={m.v} value={m.v}>{m.n}</option>
                  ))}
                </select>
                <select className="border rounded-lg px-3 py-1.5 text-sm" value={tahunPeminjaman} onChange={(e) => setTahunPeminjaman(e.target.value)}>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button onClick={() => exportPDF('peminjaman-wrap', `peminjaman-${tahunPeminjaman}-${bulanPeminjaman}.pdf`)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm">
                  PDF
                </button>
                <button onClick={() => exportExcel(statPeminjaman?.byItem || [], 'Peminjaman', `peminjaman-${tahunPeminjaman}-${bulanPeminjaman}.xlsx`)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm">
                  Excel
                </button>
              </div>
            </div>

            <div id="peminjaman-wrap" className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                  <p className="text-gray-500 text-sm">Total Peminjaman</p>
                  <p className="text-2xl font-bold">{statPeminjaman?.total ?? '-'}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl text-center">
                  <p className="text-gray-500 text-sm">Peminjaman Selesai</p>
                  <p className="text-2xl font-bold">{statPeminjaman?.done ?? '-'}</p>
                </div>
              </div>

              <div className="flex justify-center">
                {peminjamanValues.length ? (
                  <div className="w-[340px] h-[240px]">
                    <Pie
                      data={{
                        labels: peminjamanLabels,
                        datasets: [
                          { data: peminjamanValues, backgroundColor: ['#6366F1', '#A78BFA', '#F472B6', '#FBBF24', '#10B981'] },
                        ],
                      }}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">Tidak ada data</p>
                )}
              </div>
            </div>
          </section>

          {/* Statistik Pelaporan */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">Statistik Pelaporan</h2>
              <div className="flex gap-2">
                <select className="border rounded-lg px-3 py-1.5 text-sm" value={bulanPelaporan} onChange={(e) => setBulanPelaporan(e.target.value)}>
                  {monthList().map((m) => (
                    <option key={m.v} value={m.v}>{m.n}</option>
                  ))}
                </select>
                <select className="border rounded-lg px-3 py-1.5 text-sm" value={tahunPelaporan} onChange={(e) => setTahunPelaporan(e.target.value)}>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button onClick={() => exportPDF('pelaporan-wrap', `pelaporan-${tahunPelaporan}-${bulanPelaporan}.pdf`)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm">
                  PDF
                </button>
                <button onClick={() => exportExcel(statPelaporan?.byType || [], 'Pelaporan', `pelaporan-${tahunPelaporan}-${bulanPelaporan}.xlsx`)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm">
                  Excel
                </button>
              </div>
            </div>

            <div id="pelaporan-wrap" className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-pink-50 p-4 rounded-xl text-center">
                  <p className="text-gray-500 text-sm">Total Pelaporan</p>
                  <p className="text-2xl font-bold">{statPelaporan?.total ?? '-'}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl text-center">
                  <p className="text-gray-500 text-sm">Pelaporan Selesai</p>
                  <p className="text-2xl font-bold">{statPelaporan?.done ?? '-'}</p>
                </div>
              </div>

              <div className="flex justify-center">
                {pelaporanValues.length ? (
                  <div className="w-[360px] h-[240px]">
                    <Bar
                      data={{
                        labels: pelaporanLabels,
                        datasets: [{ data: pelaporanValues, backgroundColor: '#6366F1', borderRadius: 8 }],
                      }}
                      options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">Tidak ada data</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <p className="mt-8 text-xs text-gray-500 text-center">Pilih bulan lalu ekspor laporan ke PDF atau Excel.</p>
      </main>
    </div>
  )
}
