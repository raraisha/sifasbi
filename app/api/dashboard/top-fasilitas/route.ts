import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('peminjaman')
      .select('nama_barang, kode_inventaris')

    if (error) throw error

    // Hitung total per fasilitas
    const counts: { [key: string]: { nama: string; total: number } } = {}

    data?.forEach(item => {
      if (!counts[item.kode_inventaris]) {
        counts[item.kode_inventaris] = { nama: item.nama_barang, total: 0 }
      }
      counts[item.kode_inventaris].total++
    })

    // Urutkan dan ambil 5 teratas
    const result = Object.values(counts)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ message: 'Gagal mengambil data top fasilitas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
