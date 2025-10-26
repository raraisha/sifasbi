import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ========== [GET] Ambil Statistik Peminjaman ==========
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nis = searchParams.get('nis')

  if (!nis) {
    return NextResponse.json({ message: 'NIS wajib dikirim' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('peminjaman')
      .select('nama_barang, id_peminjaman')
      .or(`id_user.eq.${nis},nis.eq.${nis}`)

    if (error) throw error

    const result: Record<string, number> = {}
    data.forEach((row) => {
      const nama = row.nama_barang || 'Tidak diketahui'
      result[nama] = (result[nama] || 0) + 1
    })

    const formatted = Object.entries(result).map(([nama_fasilitas, jumlah]) => ({
      nama_fasilitas,
      jumlah,
    }))

    return NextResponse.json(formatted)
  } catch (err) {
    console.error('Error ambil statistik:', err)
    return NextResponse.json({ message: 'Gagal ambil statistik fasilitas' }, { status: 500 })
  }
}

// ========== [POST] Ajukan Peminjaman ==========
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      id_user,
      kode_inventaris,
      tanggal_pinjam,
      tanggal_kembali,
      keperluan,
      status,
    } = body

    if (!id_user || !kode_inventaris || !tanggal_pinjam || !tanggal_kembali) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.from('peminjaman').insert([
      {
        id_user,
        kode_inventaris,
        tanggal_pengajuan: new Date().toISOString().split('T')[0],
        waktu_mulai: tanggal_pinjam,
        waktu_selesai: tanggal_kembali,
        keperluan,
        status: status || 'Dipinjam',
      },
    ])

    if (error) throw error

    return NextResponse.json({ message: 'Peminjaman berhasil diajukan.', data })
  } catch (err) {
    console.error('Error ajukan peminjaman:', err)
    return NextResponse.json({ error: 'Gagal mengajukan peminjaman.' }, { status: 500 })
  }
}
