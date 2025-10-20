import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// PATCH → Update status laporan (termasuk alasan penolakan)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id_pelaporan = params.id

    // Cek dulu apakah body ada isinya
    const rawBody = await request.text()
    if (!rawBody) {
      return NextResponse.json({ message: 'Body request kosong' }, { status: 400 })
    }

    let body
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ message: 'Format JSON tidak valid' }, { status: 400 })
    }

    const { status, alasan } = body

    if (!status) {
      return NextResponse.json({ message: 'Status wajib diisi' }, { status: 400 })
    }

    // Siapkan data yang mau diupdate
    const updateData: any = { status }
    if (status === 'Ditolak') {
      updateData.alasan_penolakan = alasan && alasan.trim() !== '' ? alasan : '-'
    }

    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .update(updateData)
      .eq('id_pelaporan', id_pelaporan)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Status berhasil diperbarui', data },
      { status: 200 }
    )
  } catch (err) {
    console.error('Handler error:', err)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// GET → Ambil detail laporan berdasarkan ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id_pelaporan = params.id

    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .select('id_pelaporan, nama_barang, deskripsi, status, tanggal_lapor, alasan_penolakan')
      .eq('id_pelaporan', id_pelaporan)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Handler error:', err)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
