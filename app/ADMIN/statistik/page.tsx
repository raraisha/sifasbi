'use client'

import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
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
import { Download, FileText, Calendar } from 'lucide-react'
import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable'

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
  const [exporting, setExporting] = useState<string | null>(null)

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

  // Fetch detailed data for export
  const fetchDetailData = async (type: 'peminjaman' | 'pelaporan', bulan: string, tahun: string) => {
    try {
      const endpoint = type === 'peminjaman' 
        ? `/api/peminjaman?bulan=${tahun}-${bulan}` 
        : `/api/pelaporan?bulan=${tahun}-${bulan}`
      
      const res = await fetch(endpoint)
      const json = await res.json()
      return json.data || json || []
    } catch (error) {
      console.error('Error fetching detail data:', error)
      return []
    }
  }

  // Export to PDF with detailed data
  const exportPDF = async (type: 'peminjaman' | 'pelaporan') => {
    setExporting(type)
    
    try {
      const bulan = type === 'peminjaman' ? bulanPeminjaman : bulanPelaporan
      const tahun = type === 'peminjaman' ? tahunPeminjaman : tahunPelaporan
      const monthName = monthList().find(m => m.v === bulan)?.n || bulan
      
      // Fetch detailed data
      const detailData = await fetchDetailData(type, bulan, tahun)
      
      if (!detailData || detailData.length === 0) {
        alert('Tidak ada data untuk diekspor')
        setExporting(null)
        return
      }

      const data = type === 'peminjaman' ? statPeminjaman : statPelaporan
      const doc = new jsPDF()
      
      // Header
      doc.setFillColor(99, 102, 241)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(`Laporan ${type === 'peminjaman' ? 'Peminjaman' : 'Pelaporan'}`, 105, 20, { align: 'center' } as any)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Periode: ${monthName} ${tahun}`, 105, 28, { align: 'center' } as any)
      doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 105, 35, { align: 'center' } as any)
      
      // Statistics boxes
      doc.setTextColor(0, 0, 0)
      doc.setFillColor(243, 244, 246)
      doc.roundedRect(20, 50, 80, 30, 3, 3, 'F')
      doc.roundedRect(110, 50, 80, 30, 3, 3, 'F')
      
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text(`Total ${type === 'peminjaman' ? 'Peminjaman' : 'Pelaporan'}`, 60, 60, { align: 'center' } as any)
      doc.text(`${type === 'peminjaman' ? 'Peminjaman' : 'Pelaporan'} Selesai`, 150, 60, { align: 'center' } as any)
      
      doc.setFontSize(24)
      doc.setTextColor(31, 41, 55)
      doc.setFont('helvetica', 'bold')
      doc.text(String(data?.total ?? detailData.length), 60, 73, { align: 'center' } as any)
      doc.text(String(data?.done ?? 0), 150, 73, { align: 'center' } as any)
      
      // Detail Table
      const tableData = detailData.map((item: any, idx: number) => {
        if (type === 'peminjaman') {
          return [
            idx + 1,
            item.nama_peminjam || item.user?.name || '-',
            item.nama_fasilitas || item.fasilitas?.nama || '-',
            item.jumlah || 1,
            new Date(item.tanggal_mulai || item.createdAt).toLocaleDateString('id-ID'),
            new Date(item.tanggal_selesai || item.updatedAt).toLocaleDateString('id-ID'),
            item.status || '-'
          ]
        } else {
          return [
            idx + 1,
            item.pelapor || item.user?.name || '-',
            item.nama_fasilitas || item.fasilitas?.nama || '-',
            item.type || '-',
            item.deskripsi?.substring(0, 40) + '...' || '-',
            new Date(item.createdAt).toLocaleDateString('id-ID'),
            item.status || '-'
          ]
        }
      })
      
      ;(doc as any).autoTable({
        startY: 90,
        head: type === 'peminjaman' ? [[
          'No',
          'Nama Peminjam',
          'Fasilitas',
          'Jumlah',
          'Tanggal Mulai',
          'Tanggal Selesai',
          'Status'
        ]] : [[
          'No',
          'Pelapor',
          'Fasilitas',
          'Tipe',
          'Deskripsi',
          'Tanggal',
          'Status'
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9
        },
        columnStyles: type === 'peminjaman' ? {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'left', cellWidth: 35 },
          2: { halign: 'left', cellWidth: 40 },
          3: { halign: 'center', cellWidth: 15 },
          4: { halign: 'center', cellWidth: 30 },
          5: { halign: 'center', cellWidth: 30 },
          6: { halign: 'center', cellWidth: 25 }
        } : {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'left', cellWidth: 30 },
          2: { halign: 'left', cellWidth: 35 },
          3: { halign: 'left', cellWidth: 25 },
          4: { halign: 'left', cellWidth: 45 },
          5: { halign: 'center', cellWidth: 25 },
          6: { halign: 'center', cellWidth: 20 }
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      })
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(156, 163, 175)
        doc.text(
          `© ${new Date().getFullYear()} SMK Bina Informatika - SiFasBi | Halaman ${i} dari ${pageCount}`,
          105,
          285,
          { align: 'center' }
        )
      }
      
      doc.save(`laporan-detail-${type}-${tahun}-${bulan}.pdf`)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Gagal membuat PDF: ' + error)
    }
    
    setExporting(null)
  }

  // Export to Excel with detailed data
  const exportExcel = async (type: 'peminjaman' | 'pelaporan') => {
    setExporting(type)
    
    try {
      const bulan = type === 'peminjaman' ? bulanPeminjaman : bulanPelaporan
      const tahun = type === 'peminjaman' ? tahunPeminjaman : tahunPelaporan
      const monthName = monthList().find(m => m.v === bulan)?.n || bulan
      
      // Fetch detailed data
      const detailData = await fetchDetailData(type, bulan, tahun)
      
      if (!detailData || detailData.length === 0) {
        alert('Tidak ada data untuk diekspor')
        setExporting(null)
        return
      }

      const data = type === 'peminjaman' ? statPeminjaman : statPelaporan
      
      // Create CSV content with UTF-8 BOM
      let csvContent = '\uFEFF'
      csvContent += `"Laporan Detail ${type === 'peminjaman' ? 'Peminjaman' : 'Pelaporan'}"\n`
      csvContent += `"Periode: ${monthName} ${tahun}"\n`
      csvContent += `"Dicetak: ${new Date().toLocaleDateString('id-ID')}"\n\n`
      csvContent += `"Total ${type === 'peminjaman' ? 'Peminjaman' : 'Pelaporan'}","${data?.total ?? detailData.length}"\n`
      csvContent += `"${type === 'peminjaman' ? 'Peminjaman' : 'Pelaporan'} Selesai","${data?.done ?? 0}"\n\n`
      
      if (type === 'peminjaman') {
        csvContent += `"No","Nama Peminjam","Fasilitas","Jumlah","Tanggal Mulai","Tanggal Selesai","Status"\n`
        detailData.forEach((item: any, idx: number) => {
          const nama = (item.nama_peminjam || item.user?.name || '-').replace(/"/g, '""')
          const fasilitas = (item.nama_fasilitas || item.fasilitas?.nama || '-').replace(/"/g, '""')
          csvContent += `"${idx + 1}","${nama}","${fasilitas}","${item.jumlah || 1}","${new Date(item.tanggal_mulai || item.createdAt).toLocaleDateString('id-ID')}","${new Date(item.tanggal_selesai || item.updatedAt).toLocaleDateString('id-ID')}","${item.status || '-'}"\n`
        })
      } else {
        csvContent += `"No","Pelapor","Fasilitas","Tipe","Deskripsi","Tanggal","Status"\n`
        detailData.forEach((item: any, idx: number) => {
          const pelapor = (item.pelapor || item.user?.name || '-').replace(/"/g, '""')
          const fasilitas = (item.nama_fasilitas || item.fasilitas?.nama || '-').replace(/"/g, '""')
          const deskripsi = (item.deskripsi || '-').replace(/"/g, '""')
          csvContent += `"${idx + 1}","${pelapor}","${fasilitas}","${item.type || '-'}","${deskripsi}","${new Date(item.createdAt).toLocaleDateString('id-ID')}","${item.status || '-'}"\n`
        })
      }
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-detail-${type}-${tahun}-${bulan}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating Excel:', error)
      alert('Gagal membuat file Excel: ' + error)
    }
    
    setExporting(null)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">📊 Laporan & Statistik</h1>
          <p className="text-sm text-gray-600">Analisis data peminjaman dan pelaporan fasilitas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistik Peminjaman */}
          <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">Statistik Peminjaman</h2>
                  <p className="text-xs text-gray-500">Data bulanan peminjaman fasilitas</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800" 
                  value={bulanPeminjaman} 
                  onChange={(e) => setBulanPeminjaman(e.target.value)}
                >
                  {monthList().map((m) => (
                    <option key={m.v} value={m.v}>{m.n}</option>
                  ))}
                </select>
              </div>
              <select 
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800" 
                value={tahunPeminjaman} 
                onChange={(e) => setTahunPeminjaman(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
                  <p className="text-indigo-600 text-xs font-medium mb-1">Total Peminjaman</p>
                  <p className="text-3xl font-bold text-indigo-900">{statPeminjaman?.total ?? 0}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200">
                  <p className="text-emerald-600 text-xs font-medium mb-1">Selesai</p>
                  <p className="text-3xl font-bold text-emerald-900">{statPeminjaman?.done ?? 0}</p>
                </div>
              </div>

              <div className="flex justify-center py-4">
                {peminjamanValues.length ? (
                  <div className="w-[280px] h-[280px]">
                    <Pie
                      data={{
                        labels: peminjamanLabels,
                        datasets: [
                          { 
                            data: peminjamanValues, 
                            backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6', '#F97316'],
                            borderWidth: 2,
                            borderColor: '#fff'
                          },
                        ],
                      }}
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { padding: 15, font: { size: 11 } }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">📭 Tidak ada data untuk periode ini</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => exportPDF('peminjaman')}
                  disabled={!!exporting}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {exporting === 'peminjaman' ? 'Mengunduh...' : 'Export PDF'}
                </button>
                <button 
                  onClick={() => exportExcel('peminjaman')}
                  disabled={!!exporting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {exporting === 'peminjaman' ? 'Mengunduh...' : 'Export Excel'}
                </button>
              </div>
            </div>
          </section>

          {/* Statistik Pelaporan */}
          <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">Statistik Pelaporan</h2>
                  <p className="text-xs text-gray-500">Data bulanan pelaporan kerusakan</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800" 
                  value={bulanPelaporan} 
                  onChange={(e) => setBulanPelaporan(e.target.value)}
                >
                  {monthList().map((m) => (
                    <option key={m.v} value={m.v}>{m.n}</option>
                  ))}
                </select>
              </div>
              <select 
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800" 
                value={tahunPelaporan} 
                onChange={(e) => setTahunPelaporan(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl border border-pink-200">
                  <p className="text-pink-600 text-xs font-medium mb-1">Total Pelaporan</p>
                  <p className="text-3xl font-bold text-pink-900">{statPelaporan?.total ?? 0}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                  <p className="text-orange-600 text-xs font-medium mb-1">Selesai</p>
                  <p className="text-3xl font-bold text-orange-900">{statPelaporan?.done ?? 0}</p>
                </div>
              </div>

              <div className="flex justify-center py-4">
                {pelaporanValues.length ? (
                  <div className="w-full h-[280px]">
                    <Bar
                      data={{
                        labels: pelaporanLabels,
                        datasets: [
                          { 
                            label: 'Jumlah',
                            data: pelaporanValues, 
                            backgroundColor: '#EC4899',
                            borderRadius: 8,
                            borderWidth: 0
                          }
                        ],
                      }}
                      options={{ 
                        maintainAspectRatio: false, 
                        plugins: { 
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Jumlah: ${context.parsed.y}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { 
                              stepSize: 1,
                              precision: 0
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">📭 Tidak ada data untuk periode ini</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => exportPDF('pelaporan')}
                  disabled={!!exporting}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-pink-700 hover:to-pink-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {exporting === 'pelaporan' ? 'Mengunduh...' : 'Export PDF'}
                </button>
                <button 
                  onClick={() => exportExcel('pelaporan')}
                  disabled={!!exporting}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-orange-700 hover:to-orange-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {exporting === 'pelaporan' ? 'Mengunduh...' : 'Export Excel'}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 <strong>Tips:</strong> Export PDF/Excel akan berisi detail lengkap semua transaksi pada periode yang dipilih.
          </p>
        </div>
      </main>
    </div>
  )
}