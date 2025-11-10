import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ===== [POST] Ajukan Peminjaman =====
export async function POST(req: Request) {
  try {
    // Cek dulu content-type
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type harus application/json' },
        { status: 400 }
      )
    }

    // Ambil body JSON
    const bodyText = await req.text()
    if (!bodyText) {
      return NextResponse.json(
        { error: 'Body JSON kosong' },
        { status: 400 }
      )
    }

    let body: any
    try {
      body = JSON.parse(bodyText)
    } catch (err) {
      return NextResponse.json(
        { error: 'Body JSON tidak valid' },
        { status: 400 }
      )
    }

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

    // Validasi input wajib
    if (!id_user || !kode_inventaris || !waktu_mulai || !waktu_selesai) {
      return NextResponse.json(
        { error: 'Field id_user, kode_inventaris, waktu_mulai, dan waktu_selesai wajib diisi.' },
        { status: 400 }
      )
    }

    // Insert ke tabel peminjaman
    const { data, error } = await supabase.from('peminjaman').insert([
      {
        id_user,
        kode_inventaris,
        tanggal_pengajuan: new Date().toISOString().split('T')[0],
        waktu_mulai,
        waktu_selesai,
        keperluan: keperluan || null,
        status: status || 'Menunggu',
        nama_peminjam: nama_peminjam || null,
        nama_barang: nama_barang || null,
      },
    ])

    if (error) throw error

    return NextResponse.json({
      message: 'Peminjaman berhasil diajukan.',
      data,
    })
  } catch (err: any) {
    console.error('Error ajukan peminjaman:', err)
    return NextResponse.json(
      { error: 'Gagal mengajukan peminjaman.' },
      { status: 500 }
    )
  }
}

// ===== [GET] Ambil Daftar Peminjaman Berdasarkan NIS / ID User =====
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
