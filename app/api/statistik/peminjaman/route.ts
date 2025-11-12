import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const bulan = searchParams.get('bulan') // format: YYYY-MM

    if (!bulan || !/^\d{4}-\d{2}$/.test(bulan)) {
      return new Response(
        JSON.stringify({ error: 'Parameter bulan harus format YYYY-MM' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ambil tanggal awal dan akhir bulan
    const [year, month] = bulan.split('-').map(Number)
    const startDate = `${bulan}-01`
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10) // tanggal terakhir bulan itu

    // ambil data berdasarkan tanggal_pengajuan
    const { data, error } = await supabase
      .from('peminjaman')
      .select('status, tanggal_pengajuan')
      .gte('tanggal_pengajuan', startDate)
      .lte('tanggal_pengajuan', endDate)

    if (error) throw error

    // hitung total dan jumlah status
    const total = data?.length || 0
    const sedangDipinjam = data?.filter((d) => d.status === 'Dipinjam').length || 0
    const selesai = data?.filter((d) => d.status === 'Dikembalikan').length || 0
    const menunggu = data?.filter((d) => d.status === 'Menunggu Konfirmasi').length || 0

    const hasil = { total, sedangDipinjam, selesai, menunggu }

    return new Response(JSON.stringify(hasil), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Error statistik peminjaman:', err)
    return new Response(
      JSON.stringify({ message: 'Gagal mengambil statistik peminjaman' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
