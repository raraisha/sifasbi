import { createClient } from '@supabase/supabase-js'

function createSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const supabase = createSupabase()

  const { data, error } = await supabase.from('fasilitas').select('*')

  if (error) {
    console.error('Supabase GET error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: Request) {
  const supabase = createSupabase()

  let body
  try {
    body = await req.json()
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const {
    kode_inventaris,
    nama_fasilitas,
    jumlah_unit,
    jumlah_tersedia,
    penanggungjawab,
    kategori,
    gedung,
    ruangan,
    status,
  } = body

  if (
    !kode_inventaris ||
    !nama_fasilitas ||
    !jumlah_unit ||
    jumlah_tersedia === undefined ||
    !penanggungjawab ||
    !kategori ||
    !status
  ) {
    return new Response(JSON.stringify({ error: 'Data tidak lengkap' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data, error } = await supabase
    .from('fasilitas')
    .insert([
      {
        kode_inventaris,
        nama_fasilitas,
        jumlah_unit: Number(jumlah_unit),
        jumlah_tersedia: Number(jumlah_tersedia), // ikut dari form, bukan default
        penanggungjawab,
        kategori,
        gedung: gedung || null,
        ruangan: ruangan || null,
        status,
      },
    ])
    .select()

  if (error) {
    console.error('Supabase INSERT error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}
