'use client'

import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'

type Inventaris = {
  id_fasilitas: number
  kode_inventaris: string
  nama_fasilitas: string
  jumlah_unit: number
  jumlah_tersedia: number
  penanggungjawab: string
  status: string
  kategori: string
  gedung: string
  ruangan: string
  created_at?: string
  updated_at?: string | null
}

type User = {
  id: number
  name: string
  role: string
}

const STATUS_OPTIONS = ['Tersedia', 'Tidak Tersedia', 'Rusak', 'Hilang', 'Aktif'] as const
const KATEGORI_OPTIONS = ['Peralatan', 'Elektronik'] as const
const GEDUNG_OPTIONS = ['A', 'B', 'L'] as const

type StatusType = (typeof STATUS_OPTIONS)[number]

export default function KelolaInventarisPage() {
  const [data, setData] = useState<Inventaris[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [ruanganOptions, setRuanganOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | StatusType>('')

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Inventaris | null>(null)
  const [form, setForm] = useState<Omit<Inventaris, 'id_fasilitas'>>({
    kode_inventaris: '',
    nama_fasilitas: '',
    jumlah_unit: 0,
    jumlah_tersedia: 0,
    penanggungjawab: '',
    status: 'Tersedia',
    kategori: '',
    gedung: '',
    ruangan: '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const resData = await fetch('/api/inventaris')
      const jsonData = await resData.json()
      setData(Array.isArray(jsonData) ? jsonData : [])

      const resUsers = await fetch('/api/users?role=Admin')
      const jsonUsers = await resUsers.json()
      setUsers(Array.isArray(jsonUsers) ? jsonUsers : [])

      const resRuangan = await fetch('/api/ruangan')
      const jsonRuangan = await resRuangan.json()
      setRuanganOptions(
        Array.isArray(jsonRuangan)
          ? jsonRuangan.map((r) => r.nama_ruangan).filter((r) => r)
          : []
      )
    } catch (e) {
      console.error(e)
      alert('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data
      .filter((r) =>
        [r.nama_fasilitas, r.kode_inventaris, r.gedung, r.ruangan, r.kategori, r.penanggungjawab]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
      .filter((r) => (statusFilter ? r.status === statusFilter : true))
  }, [data, search, statusFilter])

  const resetForm = () => {
    setEditing(null)
    setForm({
      kode_inventaris: '',
      nama_fasilitas: '',
      jumlah_unit: 0,
      jumlah_tersedia: 0,
      penanggungjawab: users[0]?.name || '',
      status: 'Tersedia',
      kategori: '',
      gedung: '',
      ruangan: '',
    })
  }

  const openAdd = () => {
    if (users.length === 0) {
      alert('Belum ada user admin')
      return
    }
    resetForm()
    setOpen(true)
  }

  const openEdit = (row: Inventaris) => {
    setEditing(row)
    setForm({ ...row })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const unit = Number(form.jumlah_unit)
    const tersedia = Number(form.jumlah_tersedia)
    if (tersedia > unit) {
      alert('Jumlah tersedia tidak boleh lebih besar daripada jumlah unit')
      return
    }

    try {
      const url = editing ? `/api/inventaris/${editing.id_fasilitas}` : '/api/inventaris'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, jumlah_unit: unit, jumlah_tersedia: tersedia }),
      })
      if (!res.ok) throw new Error('Gagal simpan data')
      setOpen(false)
      await fetchData()
      resetForm()
    } catch (e) {
      console.error(e)
      alert('Gagal simpan data, cek console')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus data ini?')) return
    try {
      const res = await fetch(`/api/inventaris/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete gagal')
      await fetchData()
    } catch (e) {
      console.error(e)
      alert('Gagal menghapus data')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8FD] text-black">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar jadi collapse di mobile */}
        <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-6">Kelola Inventaris</h1>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Status"
            value={statusFilter}
            options={['', ...STATUS_OPTIONS]}
            onChange={(v) => setStatusFilter(v as StatusType | '')}
          />
          <button
            onClick={openAdd}
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-md shadow hover:brightness-110"
          >
            + Tambah
          </button>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Kode</th>
                <th className="px-4 py-2">Fasilitas</th>
                <th className="px-4 py-2">Gedung</th>
                <th className="px-4 py-2">Ruangan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">PJ</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((row) => (
                  <tr key={row.id_fasilitas} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{row.id_fasilitas}</td>
                    <td className="px-4 py-2">{row.kode_inventaris}</td>
                    <td className="px-4 py-2">{row.nama_fasilitas}</td>
                    <td className="px-4 py-2">{row.gedung}</td>
                    <td className="px-4 py-2">{row.ruangan}</td>
                    <td className="px-4 py-2">{row.status}</td>
                    <td className="px-4 py-2">{row.penanggungjawab}</td>
                    <td className="px-4 py-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="px-3 py-1 rounded bg-amber-400 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id_fasilitas)}
                        className="px-3 py-1 rounded bg-red-500 text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-lg font-semibold mb-4">
                {editing ? 'Edit Inventaris' : 'Tambah Inventaris'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Kode Inventaris" value={form.kode_inventaris} onChange={(v) => setForm((s) => ({ ...s, kode_inventaris: v }))} />
                <Input label="Nama Fasilitas" value={form.nama_fasilitas} onChange={(v) => setForm((s) => ({ ...s, nama_fasilitas: v }))} />
                <Select label="Kategori" value={form.kategori} options={KATEGORI_OPTIONS} onChange={(v) => setForm((s) => ({ ...s, kategori: v }))} />
                <Select label="Penanggung Jawab" value={form.penanggungjawab} options={users.map((u) => u.name)} onChange={(v) => setForm((s) => ({ ...s, penanggungjawab: v }))} />
                <Select label="Gedung" value={form.gedung} options={GEDUNG_OPTIONS} onChange={(v) => setForm((s) => ({ ...s, gedung: v }))} />
                <Select label="Ruangan" value={form.ruangan} options={ruanganOptions} onChange={(v) => setForm((s) => ({ ...s, ruangan: v }))} />
                <Input label="Jumlah Unit" type="number" value={String(form.jumlah_unit)} onChange={(v) => setForm((s) => ({ ...s, jumlah_unit: Number(v) || 0 }))} />
                <Input label="Jumlah Tersedia" type="number" value={String(form.jumlah_tersedia)} onChange={(v) => setForm((s) => ({ ...s, jumlah_tersedia: Number(v) || 0 }))} />
                <Select label="Status" value={form.status} options={STATUS_OPTIONS} onChange={(v) => setForm((s) => ({ ...s, status: v }))} />
              </form>
              <div className="flex flex-col md:flex-row justify-end gap-2 mt-6">
                <button onClick={() => setOpen(false)} className="px-5 py-2 border rounded-md">
                  Batal
                </button>
                <button type="submit" onClick={handleSubmit} className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-md">
                  {editing ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  )
}

function Input({
  label,
  type = 'text',
  value,
  onChange,
}: {
  label: string
  type?: 'text' | 'number'
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">Pilih {label}</option>
        {options.map((o, i) => (
          <option key={`${o}-${i}`} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}
