import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id_siswa = searchParams.get("id_siswa")

  if (!id_siswa) {
    return NextResponse.json({ message: "ID siswa tidak ditemukan" }, { status: 400 })
  }

  try {
    const [peminjamanRes, kerusakanRes] = await Promise.all([
      supabase
        .from("peminjaman")
        .select("*")
        .eq("id_user", id_siswa)
        .order("tanggal_pengajuan", { ascending: false }),
      supabase
        .from("pelaporan_kerusakan")
        .select("*")
        .eq("id_siswa", id_siswa)
        .order("waktu_dibuat", { ascending: false })
    ])

    if (peminjamanRes.error) {
      console.error("Error peminjaman:", peminjamanRes.error)
      return NextResponse.json({ message: "Gagal ambil data peminjaman" }, { status: 500 })
    }

    if (kerusakanRes.error) {
      console.error("Error kerusakan:", kerusakanRes.error)
      return NextResponse.json({ message: "Gagal ambil data kerusakan" }, { status: 500 })
    }

    return NextResponse.json({
      peminjaman: peminjamanRes.data || [],
      kerusakan: kerusakanRes.data || []
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Gagal ambil data history" }, { status: 500 })
  }
}