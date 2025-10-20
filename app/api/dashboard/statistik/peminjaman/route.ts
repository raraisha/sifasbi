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

  const { data, error } = await supabase
    .from('peminjaman')
    .select('*')
    .ilike('tanggal_pinjam', `${bulan}-%`)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
