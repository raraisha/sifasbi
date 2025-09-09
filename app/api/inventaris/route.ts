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
      .order('created_at', { ascending: false })
    if (error) throw error

    return Response.json(data)
  } catch (e) {
    console.error('GET inventaris error:', e)
    return Response.json({ message: 'Gagal ambil data inventaris' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = {
      kode_inventaris: body.kode_inventaris,
      nama_fasilitas: body.nama_fasilitas,
      jumlah_unit: Number(body.jumlah_unit),
      jumlah_tersedia: Number(body.jumlah_tersedia),
      penanggungjawab: body.penanggungjawab,
      status: body.status,
      kategori: body.kategori,
      gedung: body.gedung,
      ruangan: body.ruangan,
    }

    const { data, error } = await supabase.from('fasilitas').insert([payload]).select()
    if (error) throw error

    return Response.json(data?.[0] ?? null, { status: 201 })
  } catch (e) {
    console.error('POST inventaris error:', e)
    return Response.json({ message: 'Gagal tambah inventaris' }, { status: 500 })
  }
}
