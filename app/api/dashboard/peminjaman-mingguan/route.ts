import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - 7)

    const { data, error } = await supabase
      .from('peminjaman')
      .select('id_peminjaman, nama_peminjam, nama_barang, tanggal_pengajuan, waktu_selesai, status')
      .gte('tanggal_pengajuan', startOfWeek.toISOString())
      .order('tanggal_pengajuan', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('API Error:', err)
    return new Response(JSON.stringify({ message: 'Gagal mengambil data peminjaman mingguan' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
