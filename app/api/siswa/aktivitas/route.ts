import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nis = searchParams.get('nis')

  if (!nis) {
    return NextResponse.json({ message: 'NIS wajib dikirim' }, { status: 400 })
  }

  try {
    // Total peminjaman user
    const { count: totalPeminjaman } = await supabase
      .from('peminjaman')
      .select('*', { count: 'exact', head: true })
      .eq('id_siswa', nis)

    // Peminjaman aktif
    const { count: peminjamanAktif } = await supabase
      .from('peminjaman')
      .select('*', { count: 'exact', head: true })
      .eq('id_siswa', nis)
      .eq('status', 'Aktif')

    // Peminjaman bulan ini
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    const { count: peminjamanBulanIni } = await supabase
      .from('peminjaman')
      .select('*', { count: 'exact', head: true })
      .eq('id_siswa', nis)
      .gte('tanggal_pengajuan', startOfMonth.toISOString())

    // Laporan kerusakan
    const { count: laporanKerusakan } = await supabase
      .from('pelaporan_kerusakan')
      .select('*', { count: 'exact', head: true })
      .eq('id_siswa', nis)

    return NextResponse.json({
      totalPeminjaman,
      peminjamanAktif,
      peminjamanBulanIni,
      laporanKerusakan,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Gagal ambil data aktivitas' }, { status: 500 })
  }
}
