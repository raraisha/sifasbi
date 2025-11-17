import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Ambil data laporan + relasi ke tabel users
    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .select(`
        id_pelaporan,
        id_siswa,
        nama_barang,
        deskripsi,
        status,
        waktu_dibuat,
        ruangan,
        gedung,
        url_gambar,
        nama_siswa,
        alasan_penolakan,
        kelas,
        jurusan
      `)
      .order('waktu_dibuat', { ascending: false })

    if (error) throw error

    // Format data biar rapi dan aman ditampilkan
const formatted = data.map((item: any) => ({
  id_pelaporan: item.id_pelaporan,
  id_siswa: item.id_siswa,
  nama_siswa: item.nama_siswa || 'Tidak diketahui', // langsung ambil dari kolom
  kelas: item.kelas || 'Tidak diketahui',
  jurusan: item.jurusan || 'Tidak diketahui',
  nama_barang: item.nama_barang || 'Tidak diketahui',
  deskripsi: item.deskripsi || '-',
  status: item.status || 'Belum diproses',
  waktu_dibuat: item.waktu_dibuat,
  ruangan: item.ruangan,
  gedung: item.gedung,
  url_gambar: item.url_gambar || null,
  alasan_penolakan: item.alasan_penolakan || null
}))


    return NextResponse.json(formatted, { status: 200 })
  } catch (error: any) {
    console.error('Error fetch laporan:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
