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
      .from('pelaporan_kerusakan')
      .select(`
        id_pelaporan,
        id_siswa,
        id_admin,
        url_gambar,
        gedung,
        deskripsi,
        alasan_penolakan,
        waktu_dibuat,
        ruangan,
        status,
        nama_barang
      `)
      .gte('waktu_dibuat', startOfWeek.toISOString())
      .order('waktu_dibuat', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err) {
    console.error('API Error:', err)
    return new Response(
      JSON.stringify({ message: 'Gagal mengambil data kerusakan mingguan' }),
      { status: 500 }
    )
  }
}
