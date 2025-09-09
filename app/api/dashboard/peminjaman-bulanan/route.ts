import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const bulanIndo = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('peminjaman')
      .select('waktu_mulai')

    if (error) throw error

    // hitung jumlah per bulan
    const counts: { [key: number]: number } = {}
    data?.forEach(item => {
      const month = new Date(item.waktu_mulai).getMonth() + 1
      counts[month] = (counts[month] || 0) + 1
    })

    const result = Object.keys(counts).map(bulan => ({
      bulan: bulanIndo[parseInt(bulan)],
      jumlah: counts[parseInt(bulan)]
    }))

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ message: 'Gagal mengambil data peminjaman bulanan' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
