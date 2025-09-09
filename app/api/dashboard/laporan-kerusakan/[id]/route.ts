import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PatchBody {
  status?: string
  alasan_penolakan?: string
}

// GET by id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id_pelaporan = parseInt(params.id)

    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .select('*')
      .eq('id_pelaporan', id_pelaporan)
      .single() // ambil 1 row saja

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('API GET Error:', err)
    return new Response(
      JSON.stringify({ message: 'Gagal mengambil laporan kerusakan' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// PATCH by id
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id_pelaporan = parseInt(params.id)
    const body: PatchBody = await req.json()

    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .update(body)
      .eq('id_pelaporan', id_pelaporan)
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('API PATCH Error:', err)
    return new Response(
      JSON.stringify({ message: 'Gagal update laporan kerusakan' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
