import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('fasilitas')
      .select('ruangan')
      .not('ruangan', 'is', null) // buang null
      .order('ruangan', { ascending: true })

    if (error) throw error

    const uniqueRooms = Array.from(new Set(data.map((r: any) => r.ruangan)))

    return Response.json(uniqueRooms)
  } catch (e) {
    console.error('GET ruangan error:', e)
    return Response.json({ message: 'Gagal ambil data ruangan' }, { status: 500 })
  }
}
