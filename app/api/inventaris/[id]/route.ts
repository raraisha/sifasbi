import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('fasilitas')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 404 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Body tidak boleh kosong atau bukan JSON' }), {
      status: 400,
    })
  }

  const { kode_inventaris, nama_fasilitas, jumlah_unit, penanggungjawab } = body

  const { data, error } = await supabase
    .from('fasilitas')
    .update({ kode_inventaris, nama_fasilitas, jumlah_unit, penanggungjawab })
    .eq('id', params.id)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('fasilitas').delete().eq('id', params.id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ message: 'Berhasil hapus data' }), { status: 200 })
}
