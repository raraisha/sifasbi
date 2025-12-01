'use client'

import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { toast, Toaster } from 'react-hot-toast'
import { Search, Filter, Plus, Edit, Trash2, Package, Upload, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  gambar_url?: string | null
  created_at?: string
  updated_at?: string | null
}

const STATUS_OPTIONS = ['Tersedia', 'Tidak Tersedia', 'Rusak', 'Hilang', 'Aktif'] as const
const KATEGORI_OPTIONS = ['Peralatan', 'Elektronik'] as const
const GEDUNG_OPTIONS = ['A', 'B', 'L'] as const
const PJ_OPTIONS = ['Pak Aji', 'Mas Adam', 'Mas Fikri', 'Mas Mono']

const RUANGAN_GEDUNG_A = ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','T.P.1','T.P.2','T.L.1','T.L.2','KTN','PERPUS','UKS','LBB','PSB','SG','TU','BK','T.G.1','T.G.2','R.DPKR1','R.DPKR2','R.P.R','R.K.S','R.G','AULA','TEFA']
const RUANGAN_GEDUNG_B = ['L.ANM','L.BC','L.EDT','BCHL','STD','B.04','L.TIK','L.TKJ','L.RPL','T.P','T.L']

const RUANGAN_KELAS = ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11']
const RUANGAN_LAB = ['L.ANM','L.BC','L.EDT','L.TIK','L.TKJ','L.RPL','T.L.1','T.L.2']

const getKodeRuang = (ruangan: string): string => {
  if (RUANGAN_KELAS.includes(ruangan)) return 'RK'
  if (RUANGAN_LAB.includes(ruangan)) return 'RL'
  return 'RK' // default
}

const getBulanRomawi = (bulan: number): string => {
  const romawi = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
  return romawi[bulan - 1] || 'I'
}

export default function KelolaInventarisPage() {
  const [data, setData] = useState<Inventaris[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ruanganOptions, setRuanganOptions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Inventaris | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewImage, setViewImage] = useState<string | null>(null)
  const [bulanPembelian, setBulanPembelian] = useState<number>(new Date().getMonth() + 1)
  const [tahunPembelian, setTahunPembelian] = useState<number>(new Date().getFullYear())
  const [autoGenerateKode, setAutoGenerateKode] = useState(true)
  const [form, setForm] = useState<Omit<Inventaris, 'id_fasilitas'>>({
    kode_inventaris: '',
    nama_fasilitas: '',
    jumlah_unit: 0,
    jumlah_tersedia: 0,
    penanggungjawab: PJ_OPTIONS[0],
    status: 'Tersedia',
    kategori: '',
    gedung: '',
    ruangan: '',
    gambar_url: null,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inventaris')
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch {
      toast.error('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const generateKodeInventaris = async (gedung: string, ruangan: string): Promise<string> => {
    if (!gedung || !ruangan) return ''
    
    try {
      // Ambil data inventaris yang ada untuk menentukan nomor urut
      const res = await fetch('/api/inventaris')
      const allData: Inventaris[] = await res.json()
      
      // Filter data berdasarkan gedung yang sama
      const dataGedung = allData.filter(item => item.gedung === gedung)
      
      // Cari nomor urut terakhir
      let nomorUrut = 1
      if (dataGedung.length > 0) {
        const existingNumbers = dataGedung
          .map(item => {
            const match = item.kode_inventaris.match(/^[A-Z]\/(\d+)\//)
            return match ? parseInt(match[1]) : 0
          })
          .filter(num => !isNaN(num))
        
        nomorUrut = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
      }
      
      const nomorAlat = String(nomorUrut).padStart(3, '0')
      const kodeRuang = getKodeRuang(ruangan)
      const kodeSekolah = 'SMKBI'
      const bulanRomawi = getBulanRomawi(bulanPembelian)
      const tahunPendek = String(tahunPembelian).slice(-2)
      
      return `${gedung}/${nomorAlat}/${kodeRuang}/${kodeSekolah}/${bulanRomawi}/${tahunPendek}`
    } catch (error) {
      console.error('Error generating kode:', error)
      return ''
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data
      .filter(r =>
        [r.nama_fasilitas, r.kode_inventaris, r.gedung, r.ruangan, r.kategori, r.penanggungjawab]
          .join(' ').toLowerCase().includes(q)
      )
      .filter(r => statusFilter ? r.status === statusFilter : true)
  }, [data, search, statusFilter])

  const resetForm = () => {
    setEditing(null)
    const now = new Date()
    setBulanPembelian(now.getMonth() + 1)
    setTahunPembelian(now.getFullYear())
    setAutoGenerateKode(true)
    setForm({
      kode_inventaris: '',
      nama_fasilitas: '',
      jumlah_unit: 0,
      jumlah_tersedia: 0,
      penanggungjawab: PJ_OPTIONS[0],
      status: 'Tersedia',
      kategori: '',
      gedung: '',
      ruangan: '',
      gambar_url: null,
    })
    setRuanganOptions([])
    setImagePreview(null)
    setSelectedFile(null)
  }

  const openAdd = () => { resetForm(); setOpen(true) }
  const openEdit = (row: Inventaris) => {
    setEditing(row)
    setForm({ ...row })
    setAutoGenerateKode(false) // Saat edit, matikan auto generate
    setRuanganOptions(row.gedung === 'A' ? RUANGAN_GEDUNG_A : row.gedung === 'B' ? RUANGAN_GEDUNG_B : [])
    setImagePreview(row.gambar_url || null)
    setSelectedFile(null) // Reset selected file saat edit
    setOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB')
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = async () => {
    // Jika sedang edit dan ada gambar lama, hapus dari storage
    if (editing && form.gambar_url) {
      try {
        const fileName = form.gambar_url.split('/').pop()
        if (fileName) {
          await supabase.storage.from('fasilitas').remove([fileName])
          toast.success('Gambar lama berhasil dihapus')
        }
      } catch (error) {
        console.error('Error deleting old image:', error)
      }
    }
    
    setImagePreview(null)
    setSelectedFile(null)
    setForm(s => ({ ...s, gambar_url: null }))
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return form.gambar_url || null

    setUploading(true)
    try {
      // Jika sedang edit dan ada gambar lama, hapus dulu
      if (editing && form.gambar_url) {
        try {
          const oldFileName = form.gambar_url.split('/').pop()
          if (oldFileName) {
            await supabase.storage.from('fasilitas').remove([oldFileName])
          }
        } catch (error) {
          console.error('Error deleting old image:', error)
          // Lanjutkan upload meskipun gagal hapus gambar lama
        }
      }

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('fasilitas')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('fasilitas')
        .getPublicUrl(filePath)

      toast.success('Gambar berhasil diupload!')
      return urlData.publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Gagal upload gambar')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.jumlah_tersedia > form.jumlah_unit) {
      toast.error('Jumlah tersedia tidak boleh lebih besar dari unit')
      return
    }

    try {
      let gambar_url = form.gambar_url
      let kode_inventaris = form.kode_inventaris

      // Auto generate kode jika diperlukan
      if (autoGenerateKode && !editing) {
        kode_inventaris = await generateKodeInventaris(form.gedung, form.ruangan)
        if (!kode_inventaris) {
          toast.error('Gagal generate kode inventaris')
          return
        }
      }

      // Upload gambar terlebih dahulu jika ada file baru
      if (selectedFile) {
        const uploadedUrl = await uploadImage()
        if (!uploadedUrl) return
        gambar_url = uploadedUrl
      }

      const url = editing ? `/api/inventaris/${editing.id_fasilitas}` : '/api/inventaris'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kode_inventaris, gambar_url })
      })
      
      if (!res.ok) throw new Error()
      
      // Ambil data yang baru di-update dari response
      const updatedData = await res.json()
      
      // Update state data secara langsung tanpa fetch ulang
      if (editing) {
        setData(prevData => 
          prevData.map(item => 
            item.id_fasilitas === editing.id_fasilitas 
              ? { ...item, ...form, kode_inventaris, gambar_url, updated_at: new Date().toISOString() }
              : item
          )
        )
      } else {
        setData(prevData => [...prevData, updatedData])
      }
      
      toast.success(editing ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!')
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menyimpan data') 
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus data ini?')) return
    
    try {
      // Cari data yang akan dihapus untuk ambil URL gambar
      const itemToDelete = data.find(item => item.id_fasilitas === id)
      
      // Hapus gambar dari storage jika ada
      if (itemToDelete?.gambar_url) {
        try {
          const fileName = itemToDelete.gambar_url.split('/').pop()
          if (fileName) {
            await supabase.storage.from('fasilitas').remove([fileName])
          }
        } catch (error) {
          console.error('Error deleting image:', error)
          // Lanjutkan hapus data meskipun gagal hapus gambar
        }
      }
      
      const res = await fetch(`/api/inventaris/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      
      // Update state langsung tanpa fetch ulang
      setData(prevData => prevData.filter(item => item.id_fasilitas !== id))
      
      toast.success('Data berhasil dihapus!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menghapus data')
    }
  }

  const tanggalSekarang = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      'Tersedia': 'bg-green-100 text-green-800 border-green-300',
      'Tidak Tersedia': 'bg-red-100 text-red-800 border-red-300',
      'Rusak': 'bg-orange-100 text-orange-800 border-orange-300',
      'Hilang': 'bg-gray-100 text-gray-800 border-gray-300',
      'Aktif': 'bg-blue-100 text-blue-800 border-blue-300',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-black">
      <Toaster position="top-right" />
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl px-6 py-5 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">Kelola Inventaris Fasilitas</h1>
              <p className="text-indigo-100 text-sm mt-1">Kelola data inventaris dan ketersediaan fasilitas</p>
            </div>
            <span className="text-sm text-indigo-100 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              {tanggalSekarang}
            </span>
          </div>

          {/* Search & Filter & Add Button */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari kode, nama fasilitas, gedung, ruangan..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-black transition-all"
                value={search} 
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-black appearance-none bg-white transition-all"
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button 
              onClick={openAdd} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
            >
              <Plus size={20} />
              Tambah Data
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse text-black">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Foto</th>
                    <th className="px-4 py-4 font-semibold">ID</th>
                    <th className="px-4 py-4 font-semibold">Kode</th>
                    <th className="px-4 py-4 font-semibold">Nama Fasilitas</th>
                    <th className="px-4 py-4 font-semibold">Kategori</th>
                    <th className="px-4 py-4 font-semibold">Gedung</th>
                    <th className="px-4 py-4 font-semibold">Ruangan</th>
                    <th className="px-4 py-4 font-semibold">Unit</th>
                    <th className="px-4 py-4 font-semibold">Tersedia</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">PJ</th>
                    <th className="px-4 py-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={12} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <p className="text-gray-500">Memuat data...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!loading && filtered.map(row => (
                    <tr key={row.id_fasilitas} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3">
                        {row.gambar_url ? (
                          <img 
                            src={row.gambar_url} 
                            alt={row.nama_fasilitas}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-400 transition-all"
                            onClick={() => setViewImage(row.gambar_url!)}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{row.id_fasilitas}</td>
                      <td className="px-4 py-3 font-mono text-xs">{row.kode_inventaris}</td>
                      <td className="px-4 py-3 font-medium">{row.nama_fasilitas}</td>
                      <td className="px-4 py-3">{row.kategori}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs font-semibold">
                          {row.gedung}
                        </span>
                      </td>
                      <td className="px-4 py-3">{row.ruangan}</td>
                      <td className="px-4 py-3 text-center">{row.jumlah_unit}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`${row.jumlah_tersedia > 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                          {row.jumlah_tersedia}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${getStatusBadge(row.status)} px-3 py-1 rounded-full text-xs font-semibold border`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{row.penanggungjawab}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => openEdit(row)} 
                            className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-600 transition-all shadow-sm flex items-center gap-1"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(row.id_fasilitas)} 
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition-all shadow-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={12} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-gray-100 rounded-full p-4">
                            <Package size={32} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Tidak ada data inventaris</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Form */}
          {open && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -m-6 mb-6 p-6 rounded-t-3xl">
                  <h2 className="text-2xl font-bold text-white text-center">
                    {editing ? 'Edit Data Inventaris' : 'Tambah Data Inventaris'}
                  </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Upload Gambar */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Klik untuk upload foto fasilitas</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG (Max 5MB)</p>
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Auto Generate Toggle */}
                    {!editing && (
                      <div className="md:col-span-2 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoGenerateKode}
                            onChange={(e) => setAutoGenerateKode(e.target.checked)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                          <div>
                            <span className="font-semibold text-indigo-900">Auto Generate Kode Inventaris</span>
                            <p className="text-xs text-indigo-600 mt-0.5">
                              Format: {form.gedung || 'X'}/{'{'}XXX{'}'}/{form.ruangan ? getKodeRuang(form.ruangan) : 'XX'}/SMKBI/{getBulanRomawi(bulanPembelian)}/{String(tahunPembelian).slice(-2)}
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Kode Inventaris - Show only if not auto generate or editing */}
                    {(!autoGenerateKode || editing) && (
                      <div className="md:col-span-2">
                        <Input 
                          label="Kode Inventaris" 
                          value={form.kode_inventaris} 
                          onChange={v => setForm(s => ({ ...s, kode_inventaris: v }))} 
                        />
                      </div>
                    )}

                    {/* Bulan & Tahun Pembelian - Show only when auto generate */}
                    {autoGenerateKode && !editing && (
                      <>
                        <div>
                          <label className="block font-semibold mb-2 text-gray-700">Bulan Pembelian</label>
                          <select
                            value={bulanPembelian}
                            onChange={(e) => setBulanPembelian(Number(e.target.value))}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all appearance-none bg-white"
                          >
                            {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((bulan, idx) => (
                              <option key={idx} value={idx + 1}>{bulan} ({getBulanRomawi(idx + 1)})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold mb-2 text-gray-700">Tahun Pembelian</label>
                          <input
                            type="number"
                            value={tahunPembelian}
                            onChange={(e) => setTahunPembelian(Number(e.target.value))}
                            min={2000}
                            max={2099}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                          />
                        </div>
                      </>
                    )}

                    <Input label="Nama Fasilitas" value={form.nama_fasilitas} onChange={v => setForm(s => ({ ...s, nama_fasilitas: v }))} />
                    <Select label="Kategori" value={form.kategori} options={KATEGORI_OPTIONS} onChange={v => setForm(s => ({ ...s, kategori: v }))} />
                    <Select label="Penanggung Jawab" value={form.penanggungjawab} options={PJ_OPTIONS} onChange={v => setForm(s => ({ ...s, penanggungjawab: v }))} />
                    <Select
                      label="Gedung" value={form.gedung} options={GEDUNG_OPTIONS}
                      onChange={v => {
                        setForm(s => ({ ...s, gedung: v, ruangan: '' }))
                        setRuanganOptions(v === 'A' ? RUANGAN_GEDUNG_A : v === 'B' ? RUANGAN_GEDUNG_B : [])
                      }}
                    />
                    <Select label="Ruangan" value={form.ruangan} options={ruanganOptions} onChange={v => setForm(s => ({ ...s, ruangan: v }))} />
                    <Input label="Jumlah Unit" type="number" value={String(form.jumlah_unit)} onChange={v => setForm(s => ({ ...s, jumlah_unit: Number(v) || 0 }))} />
                    <Input label="Jumlah Tersedia" type="number" value={String(form.jumlah_tersedia)} onChange={v => setForm(s => ({ ...s, jumlah_tersedia: Number(v) || 0 }))} />
                    <Select label="Status" value={form.status} options={STATUS_OPTIONS} onChange={v => setForm(s => ({ ...s, status: v }))} />
                  </div>
                
                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      type="button"
                      onClick={() => setOpen(false)} 
                      className="px-6 py-2.5 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      disabled={uploading}
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Mengupload...' : editing ? 'Simpan Perubahan' : 'Tambah Data'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal View Image */}
          {viewImage && (
            <div 
              className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setViewImage(null)}
            >
              <div className="relative max-w-4xl max-h-[90vh]">
                <button
                  onClick={() => setViewImage(null)}
                  className="absolute -top-4 -right-4 bg-white text-gray-900 rounded-full p-2 hover:bg-gray-100 shadow-lg"
                >
                  <X size={24} />
                </button>
                <img 
                  src={viewImage} 
                  alt="View" 
                  className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function Input({ label, type = 'text', value, onChange }: { label: string; type?: 'text'|'number'; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block font-semibold mb-2 text-gray-700">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
        required
      />
    </div>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[] | string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block font-semibold mb-2 text-gray-700">{label}</label>
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all appearance-none bg-white"
        required
      >
        <option value="">Pilih {label}</option>
        {options.map((o, i) => <option key={`${o}-${i}`} value={o}>{o}</option>)}
      </select>
    </div>
  )
}