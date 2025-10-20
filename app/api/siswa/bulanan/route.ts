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
      .select('id_peminjaman, tanggal_pengajuan')
      .eq('id_user', nis)

    if (error) throw error

    // Grouping manual pake JS
    const result: Record<string, number> = {}
    data.forEach((row) => {
      const date = new Date(row.tanggal_pengajuan)
      const bulan = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      result[bulan] = (result[bulan] || 0) + 1
    })

    const formatted = Object.entries(result).map(([bulan, jumlah]) => ({
      bulan,
      jumlah,
    }))

    return NextResponse.json(formatted)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Gagal ambil data bulanan' }, { status: 500 })
  }
}
