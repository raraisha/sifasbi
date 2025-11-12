import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const bulan = searchParams.get('bulan')

    if (!bulan || !/^\d{4}-\d{2}$/.test(bulan)) {
      return new Response(
        JSON.stringify({ error: 'Parameter bulan harus format YYYY-MM' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const [year, month] = bulan.split('-').map(Number)
    const startDate = `${bulan}-01`
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .select('status, waktu_dibuat')
      .gte('waktu_dibuat', startDate)
      .lte('waktu_dibuat', endDate)

    if (error) throw error

    const total = data?.length || 0
    const selesai = data?.filter((d) => d.status === 'Selesai').length || 0
    const proses = data?.filter((d) => d.status === 'Diproses').length || 0
    const ditolak = data?.filter((d) => d.status === 'Ditolak').length || 0

    const hasil = { total, selesai, proses, ditolak }

    return new Response(JSON.stringify(hasil), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Error statistik pelaporan:', err)
    return new Response(
      JSON.stringify({ message: 'Gagal mengambil statistik pelaporan' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
