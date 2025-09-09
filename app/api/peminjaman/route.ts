import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('peminjaman')
      .select('*')
      .order('tanggal_pengajuan', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Error fetching peminjaman:', err)
    return new Response(
      JSON.stringify({ message: 'Gagal mengambil data peminjaman' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
