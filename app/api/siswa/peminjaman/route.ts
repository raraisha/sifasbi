import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      nis,
      kode_inventaris,
      tanggal_pinjam,
      waktu_selesai,
      keperluan,
      status,
    } = body

    console.log('Data diterima:', body)

    if (!nis || !kode_inventaris || !tanggal_pinjam || !waktu_selesai || !keperluan) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
    }

    // === Ambil data user dari tabel users ===
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('nama, email, nis')
      .eq('nis', nis)
      .single()

    if (userError || !userData) {
      console.error('User tidak ditemukan:', userError)
      return NextResponse.json({ error: 'User tidak ditemukan di database.' }, { status: 404 })
    }

    // === Ambil data fasilitas untuk nama_barang & stok ===
    const { data: fasilitas, error: errFasilitas } = await supabase
      .from('fasilitas')
      .select('nama_fasilitas, jumlah_tersedia')
      .eq('kode_inventaris', kode_inventaris)
      .single()

    if (errFasilitas) throw new Error('Gagal mengambil data fasilitas.')
    if (!fasilitas || fasilitas.jumlah_tersedia <= 0)
      throw new Error('Fasilitas tidak tersedia.')

    // === Insert data ke tabel peminjaman ===
    const { error: errInsert } = await supabase.from('peminjaman').insert([
      {
        id_user: nis,
        kode_inventaris,
        tanggal_pengajuan: new Date().toISOString().split('T')[0], // tanggal hari ini
        waktu_mulai: tanggal_pinjam,
        waktu_selesai,
        keperluan,
        status: status || 'Dipinjam',
        nama_peminjam: userData.nama,
        nama_barang: fasilitas.nama_fasilitas,
      },
    ])

    if (errInsert) {
      console.error('Error insert:', errInsert)
      throw new Error('Gagal menambah data peminjaman.')
    }

    // === Kurangi stok fasilitas ===
    const { error: errUpdate } = await supabase
      .from('fasilitas')
      .update({ jumlah_tersedia: fasilitas.jumlah_tersedia - 1 })
      .eq('kode_inventaris', kode_inventaris)

    if (errUpdate) {
      console.error('Error update stok:', errUpdate)
      throw new Error('Gagal memperbarui stok fasilitas.')
    }

    return NextResponse.json({ message: 'Peminjaman berhasil diajukan.' })
  } catch (error: any) {
    console.error('Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
