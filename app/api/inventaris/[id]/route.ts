import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const { data, error } = await supabase
      .from('fasilitas')
      .select('*')
      .eq('id_fasilitas', id)
      .single()
    if (error) throw error

    return Response.json(data)
  } catch (e) {
    console.error('GET by id error:', e)
    return Response.json({ message: 'Gagal ambil detail inventaris' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await req.json()
    const payload = {
      ...body,
      jumlah_unit: Number(body.jumlah_unit),
      jumlah_tersedia: Number(body.jumlah_tersedia),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('fasilitas')
      .update(payload)
      .eq('id_fasilitas', id)
      .select()
    if (error) throw error

    return Response.json(data?.[0] ?? null)
  } catch (e) {
    console.error('PATCH inventaris error:', e)
    return Response.json({ message: 'Gagal update inventaris' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const { error } = await supabase.from('fasilitas').delete().eq('id_fasilitas', id)
    if (error) throw error

    return Response.json({ message: 'Inventaris berhasil dihapus' })
  } catch (e) {
    console.error('DELETE inventaris error:', e)
    return Response.json({ message: 'Gagal hapus inventaris' }, { status: 500 })
  }
}
