import { createClient } from '@supabase/supabase-js'

function createSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const supabase = createSupabase()

  const { data, error } = await supabase
    .from('fasilitas')
    .select('*')
    .eq('id_fasilitas', params.id)
    .single()

  if (error) {
    console.error('Supabase GET error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify(data), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const supabase = createSupabase()

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Body tidak boleh kosong atau bukan JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
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

  // Validasi data
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
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Validasi jumlah tersedia tidak boleh lebih besar dari unit
  if (Number(jumlah_tersedia) > Number(jumlah_unit)) {
    return new Response(JSON.stringify({ error: 'Jumlah tersedia tidak boleh lebih besar dari unit' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { data, error } = await supabase
    .from('fasilitas')
    .update({
      kode_inventaris,
      nama_fasilitas,
      jumlah_unit: Number(jumlah_unit),
      jumlah_tersedia: Number(jumlah_tersedia),
      penanggungjawab,
      kategori,
      gedung: gedung || null,
      ruangan: ruangan || null,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id_fasilitas', params.id)
    .select()

  if (error) {
    console.error('Supabase UPDATE error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify(data), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const supabase = createSupabase()

  const { error } = await supabase
    .from('fasilitas')
    .delete()
    .eq('id_fasilitas', params.id)

  if (error) {
    console.error('Supabase DELETE error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ message: 'Berhasil hapus data' }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}