import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ===== [GET] Ambil Semua Data Peminjaman =====
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

// ===== [PATCH] Update Status Peminjaman =====
export async function PATCH(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type harus application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { id_peminjaman, status } = body

    if (!id_peminjaman || !status) {
      return new Response(
        JSON.stringify({ error: 'Field id_peminjaman dan status wajib dikirim.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase
      .from('peminjaman')
      .update({ status })
      .eq('id_peminjaman', id_peminjaman)
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Status berhasil diperbarui', data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error update status:', err)
    return new Response(
      JSON.stringify({ message: 'Gagal memperbarui status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
