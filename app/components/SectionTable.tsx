'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Calendar, Package, User, MapPin, Clock, Hash, AlertCircle } from 'lucide-react'

export default function SectionTable({ 
  title, 
  headers, 
  rows, 
  link 
}: { 
  title: string
  headers: string[]
  rows: any[][]
  link: string
}) {
  const router = useRouter()
  
  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'Disetujui': { 
        bg: 'bg-gradient-to-r from-green-500 to-emerald-600', 
        text: 'text-white',
        icon: '✓',
        glow: 'shadow-green-500/50'
      },
      'Menunggu': { 
        bg: 'bg-gradient-to-r from-yellow-500 to-amber-600', 
        text: 'text-white',
        icon: '⏳',
        glow: 'shadow-yellow-500/50'
      },
      'Ditolak': { 
        bg: 'bg-gradient-to-r from-red-500 to-rose-600', 
        text: 'text-white',
        icon: '✕',
        glow: 'shadow-red-500/50'
      },
      'Selesai': { 
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
        text: 'text-white',
        icon: '★',
        glow: 'shadow-blue-500/50'
      },
      'Sedang Diperbaiki': { 
        bg: 'bg-gradient-to-r from-orange-500 to-red-600', 
        text: 'text-white',
        icon: '🔧',
        glow: 'shadow-orange-500/50'
      },
      'Belum Diperbaiki': { 
        bg: 'bg-gradient-to-r from-gray-500 to-slate-600', 
        text: 'text-white',
        icon: '⚠',
        glow: 'shadow-gray-500/50'
      }
    }
    
    const config = statusConfig[status] || { 
      bg: 'bg-gradient-to-r from-gray-400 to-gray-500', 
      text: 'text-white',
      icon: '•',
      glow: 'shadow-gray-500/50'
    }
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${config.bg} ${config.text} shadow-lg ${config.glow} transform hover:scale-105 transition-all duration-300`}>
        <span className="text-sm">{config.icon}</span>
        {status}
      </span>
    )
  }

  const getHeaderIcon = (header: string) => {
    const iconMap: any = {
      'ID': <Hash className="w-4 h-4" />,
      'Nama': <User className="w-4 h-4" />,
      'Nama Peminjam': <User className="w-4 h-4" />,
      'Fasilitas': <Package className="w-4 h-4" />,
      'Waktu Pinjam': <Calendar className="w-4 h-4" />,
      'Waktu Selesai': <Clock className="w-4 h-4" />,
      'Waktu Lapor': <Calendar className="w-4 h-4" />,
      'Ruangan': <MapPin className="w-4 h-4" />,
      'Status': <AlertCircle className="w-4 h-4" />
    }
    return iconMap[header] || null
  }

  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 overflow-hidden group">
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full transform translate-x-20 -translate-y-20 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"></div>

      {/* Header Section */}
      <div className="relative px-6 sm:px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {rows.length} data tersedia
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.push(link)}
            className="group/btn relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B36FF2] to-[#273B98] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
            <span className="relative">Lihat Semua</span>
            <ArrowRight className="relative w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
              {headers.map((h, idx) => (
                <th 
                  key={idx} 
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-indigo-200/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600">{getHeaderIcon(h)}</span>
                    {h}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-4">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Belum ada data</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className="group/row hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                >
                  {row.map((cell, cellIdx) => (
                    <td 
                      key={cellIdx} 
                      className="px-6 py-4 text-sm text-gray-700 group-hover/row:text-gray-900 transition-colors duration-300"
                    >
                      {cellIdx === row.length - 1 ? (
                        getStatusBadge(cell)
                      ) : cellIdx === 0 ? (
                        <span className="font-mono font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                          {cell}
                        </span>
                      ) : cellIdx === 1 ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {cell?.toString().charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold">{cell}</span>
                        </div>
                      ) : (
                        <span className="font-medium">{cell}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      {rows.length > 0 && (
        <div className="px-6 sm:px-8 py-4 bg-gradient-to-r from-gray-50/80 to-white/80 border-t border-gray-200/50">
          <p className="text-sm text-gray-600 text-center">
            Menampilkan <span className="font-bold text-indigo-600">{rows.length}</span> dari total data
          </p>
        </div>
      )}
    </div>
  )
}