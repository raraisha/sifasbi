import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// [POST] Ajukan Peminjaman
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      id_user,
      kode_inventaris,
      waktu_mulai,
      waktu_selesai,
      keperluan,
      status,
      nama_peminjam,
      nama_barang,
    } = body

    // Validasi input
    if (!id_user || !kode_inventaris || !waktu_mulai || !waktu_selesai) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi.' },
        { status: 400 }
      )
    }

    // Insert data ke tabel peminjaman
    const { data, error } = await supabase.from('peminjaman').insert([
      {
        id_user,
        kode_inventaris,
        tanggal_pengajuan: new Date().toISOString().split('T')[0],
        waktu_mulai,
        waktu_selesai,
        keperluan,
        status: status || 'Dipinjam',
        nama_peminjam: nama_peminjam || null,
        nama_barang: nama_barang || null,
      },
    ])

    if (error) throw error

    return NextResponse.json({ message: 'Peminjaman berhasil diajukan.', data })
  } catch (err) {
    console.error('Error ajukan peminjaman:', err)
    return NextResponse.json(
      { error: 'Gagal mengajukan peminjaman.' },
      { status: 500 }
    )
  }
}

// [GET] Ambil Daftar Peminjaman Berdasarkan NIS / ID User
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nis = searchParams.get('nis')

  if (!nis) {
    return NextResponse.json({ error: 'NIS wajib dikirim.' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('peminjaman')
      .select('*')
      .or(`id_user.eq.${nis},nis.eq.${nis}`)

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error ambil data peminjaman:', err)
    return NextResponse.json(
      { error: 'Gagal mengambil data peminjaman.' },
      { status: 500 }
    )
  }
}
