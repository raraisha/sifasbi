import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
      .eq('id_user', nis)

    if (error) throw error

    // Hitung jumlah peminjaman per fasilitas
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
    console.error(err)
    return NextResponse.json({ message: 'Gagal ambil statistik fasilitas' }, { status: 500 })
  }
}
