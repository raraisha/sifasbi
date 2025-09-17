import { createClient } from '@supabase/supabase-js'

export async function GET(_: Request, { params }: { params: { id: string } }) {
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
    return new Response(JSON.stringify({ error }), { status: 404 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.json()
  const { kode_inventaris, nama_fasilitas, jumlah_unit, penanggungjawab } = body

  const { data, error } = await supabase
    .from('fasilitas')
    .update({ kode_inventaris, nama_fasilitas, jumlah_unit, penanggungjawab })
    .eq('id', params.id)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('fasilitas').delete().eq('id', params.id)

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  return new Response(JSON.stringify({ message: 'Berhasil hapus' }), { status: 200 })
}
