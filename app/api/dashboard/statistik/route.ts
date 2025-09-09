import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { count: totalPeminjaman } = await supabase
      .from('peminjaman')
      .select('*', { count: 'exact', head: true })

    const { count: fasilitasPerbaikan } = await supabase
      .from('fasilitas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'perbaikan')

    const { count: menungguPersetujuan } = await supabase
      .from('peminjaman')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Menunggu')

    const { count: laporanAktif } = await supabase
      .from('pelaporan_kerusakan')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Menunggu')

    return new Response(
      JSON.stringify({
        totalPeminjaman,
        fasilitasPerbaikan,
        menungguPersetujuan,
        laporanAktif
      }),
      { status: 200 }
    )
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ message: 'Gagal mengambil data statistik' }), { status: 500 })
  }
}
