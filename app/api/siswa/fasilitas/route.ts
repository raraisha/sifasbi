import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('fasilitas')
      .select('*')

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Gagal ambil daftar fasilitas' }, { status: 500 })
  }
}
