import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const bulan = searchParams.get('bulan') // format: 2025-10

  if (!bulan) {
    return NextResponse.json({ error: 'Parameter bulan wajib diisi' }, { status: 400 })
  }

  // Hitung rentang tanggal bulan tsb
  const [tahun, bulanNum] = bulan.split('-').map(Number)
  const awalBulan = new Date(tahun, bulanNum - 1, 1).toISOString().split('T')[0]
  const akhirBulan = new Date(tahun, bulanNum, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('pelaporan_kerusakan')
    .select('*')
    .gte('tanggal_lapor', awalBulan)
    .lte('tanggal_lapor', akhirBulan)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
