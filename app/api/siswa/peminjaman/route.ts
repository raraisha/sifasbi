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
      id_siswa, // ganti dari id_siswa ke id_user
      kode_inventaris,
      tanggal_pengajuan,
      waktu_pengembalian,
      keperluan
    } = body

    console.log('Data masuk:', body)

    // 1. Cek stok fasilitas
    const { data: fasilitas, error: errFasilitas } = await supabase
      .from('fasilitas')
      .select('jumlah_tersedia')
      .eq('kode_inventaris', kode_inventaris)
      .single()

    if (errFasilitas) {
      console.error('Error fasilitas:', errFasilitas)
      throw new Error('Gagal ambil data fasilitas')
    }

    if (!fasilitas || fasilitas.jumlah_tersedia <= 0) {
      throw new Error('Fasilitas tidak tersedia')
    }

    // 2. Insert ke tabel peminjaman
    const { error: errInsert } = await supabase.from('peminjaman').insert([
      {
        id_siswa, // disesuaikan
        kode_inventaris,
        tanggal_pengajuan,
        waktu_pengembalian,
        keperluan,
        status: 'Menunggu Persetujuan'
      }
    ])

    if (errInsert) {
      console.error('Error insert:', errInsert)
      throw new Error('Gagal menambah data peminjaman')
    }

    // 3. Kurangi stok fasilitas
    const { error: errUpdate } = await supabase
      .from('fasilitas')
      .update({ jumlah_tersedia: fasilitas.jumlah_tersedia - 1 })
      .eq('kode_inventaris', kode_inventaris)

    if (errUpdate) {
      console.error('Error update:', errUpdate)
      throw new Error('Gagal memperbarui stok fasilitas')
    }

    return NextResponse.json({ message: 'Peminjaman berhasil diajukan' })
  } catch (error: any) {
    console.error('Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
