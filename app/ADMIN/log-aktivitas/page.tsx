'use client'

import Sidebar from '../../components/Sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogAktivitasPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/log-aktivitas')
        if (!res.ok) throw new Error('Gagal ambil log')
        const data = await res.json()
        setLogs(data)
      } catch (err) {
        console.error(err)
        const storedUser = localStorage.getItem('user')
        if (!storedUser) router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [router])

  return (
    <div className="flex min-h-screen bg-[#F9F8FD]">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6 text-black">Log Aktivitas</h1>

        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse text-black">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Detail</th>
                <th className="px-4 py-2">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log: any) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{log.id}</td>
                    <td className="px-4 py-2">{log.aksi}</td>
                    <td className="px-4 py-2">{log.detail || '-'}</td>
                    <td className="px-4 py-2">{formatWaktu(log.waktu)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Tidak ada aktivitas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function formatWaktu(waktu: string) {
  const t = new Date(waktu)
  return `${t.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })} ${t.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })} WIB`
}
