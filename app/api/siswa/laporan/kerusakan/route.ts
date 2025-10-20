import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const id_siswa = formData.get("id_siswa") as string
    const gedung = formData.get("gedung") as string
    const ruangan = formData.get("ruangan") as string
    const nama_barang = formData.get("nama_barang") as string
    const deskripsi = formData.get("deskripsi") as string
    const foto = formData.get("foto") as File | null

    console.log("Data diterima dari form:")
    console.log({
      id_siswa,
      gedung,
      ruangan,
      nama_barang,
      deskripsi,
      adaFoto: !!foto,
    })

    if (!id_siswa || !gedung || !ruangan || !deskripsi) {
      return NextResponse.json({ message: "Data wajib diisi" }, { status: 400 })
    }

    let url_gambar = null
    if (foto) {
      const buffer = await foto.arrayBuffer()
      const fileName = `kerusakan/${Date.now()}-${foto.name}`
      const { error: uploadError } = await supabase.storage
        .from("kerusakan")
        .upload(fileName, buffer, { contentType: foto.type })

      if (uploadError) throw uploadError

      // perbaikan path public file
      url_gambar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kerusakan/${fileName}`
    }

    const { error } = await supabase.from("pelaporan_kerusakan").insert([
      {
        id_siswa,
        gedung,
        ruangan,
        nama_barang,
        deskripsi,
        url_gambar,
        status: "Menunggu Konfirmasi",
      },
    ])

    if (error) throw error

    return NextResponse.json({ message: "Laporan berhasil dikirim" })
  } catch (err) {
    console.error("Error kirim laporan:", err)
    return NextResponse.json({ message: "Gagal kirim laporan" }, { status: 500 })
  }
}
