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
const { data: peminjaman, error: errorPeminjaman } = await supabase
  .from("peminjaman")
  .select("*")
  .eq("id_siswa", id_siswa)
  .order("tanggal_pengajuan", { ascending: false })

const { data: kerusakan, error: errorKerusakan } = await supabase
  .from("pelaporan_kerusakan")
  .select("*")
  .eq("id_siswa", id_siswa)
  .order("waktu_dibuat", { ascending: false })

console.log("peminjaman:", peminjaman, "error:", errorPeminjaman)
console.log("kerusakan:", kerusakan, "error:", errorKerusakan)


    return NextResponse.json({ peminjaman, kerusakan })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Gagal ambil data history" }, { status: 500 })
  }
}
