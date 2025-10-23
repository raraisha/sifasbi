import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const id_siswa = formData.get("id_siswa") as string
    const gedung = formData.get("gedung") as string
    const ruangan = formData.get("ruangan") as string
    const nama_barang = formData.get("nama_barang") as string
    const deskripsi = formData.get("deskripsi") as string
    const foto = formData.get("foto") as File | null

    if (!id_siswa || !gedung || !ruangan || !deskripsi) {
      return NextResponse.json({ message: "Data wajib diisi" }, { status: 400 })
    }

    // === Upload Foto ke Supabase Storage ===
    let url_gambar = null
    if (foto) {
      const buffer = await foto.arrayBuffer()
      const fileName = `kerusakan/${Date.now()}-${foto.name}`
      const { error: uploadError } = await supabase.storage
        .from("kerusakan")
        .upload(fileName, buffer, { contentType: foto.type })

      if (uploadError) throw uploadError

      url_gambar = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kerusakan/${fileName}`
    }

    // === Ambil data user dari tabel users ===
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("nama, email, nis")
      .eq("nis", id_siswa)
      .single()

    if (userError || !userData) {
      console.error("User tidak ditemukan:", userError)
      return NextResponse.json({
        message: "Laporan tersimpan, tapi gagal kirim notifikasi email",
      })
    }

    // === Simpan laporan ke tabel pelaporan_kerusakan ===
    const { error: insertError } = await supabase.from("pelaporan_kerusakan").insert([
      {
        id_siswa: userData.nis,
        nama_siswa: userData.nama,
        gedung,
        ruangan,
        nama_barang,
        deskripsi,
        url_gambar,
        status: "Menunggu Konfirmasi",
      },
    ])

    if (insertError) throw insertError

    // === Tampilan email yang konsisten dengan versi update ===
    const emailContent = `
      <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:24px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align:center;">
            <h1 style="color:#2563eb; margin-bottom:8px;">Laporan Kamu Diterima ✅</h1>
            <p style="color:#4b5563; font-size:15px;">Halo <strong>${userData.nama}</strong>, laporan kamu sudah berhasil dikirim dan sedang menunggu konfirmasi dari tim kami.</p>
          </div>

          <div style="margin-top:24px;">
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tr><td style="padding:8px 0; color:#6b7280;">Gedung</td><td><strong>${gedung}</strong></td></tr>
              <tr><td style="padding:8px 0; color:#6b7280;">Ruangan</td><td><strong>${ruangan}</strong></td></tr>
              <tr><td style="padding:8px 0; color:#6b7280;">Barang</td><td><strong>${nama_barang || "-"}</strong></td></tr>
              <tr><td style="padding:8px 0; color:#6b7280;">Deskripsi</td><td>${deskripsi}</td></tr>
              ${
                url_gambar
                  ? `<tr><td style="padding:8px 0; color:#6b7280;">Foto</td><td><a href="${url_gambar}" style="color:#2563eb;">Lihat Gambar</a></td></tr>`
                  : ""
              }
              <tr><td style="padding:8px 0; color:#6b7280;">Status</td><td><span style="background:#fef9c3; color:#854d0e; padding:4px 10px; border-radius:6px; font-weight:600;">Menunggu Konfirmasi</span></td></tr>
            </table>
          </div>

          <div style="margin-top:24px; text-align:center;">
            <a href="mailto:raishaafiqaah@gmail.com" style="text-decoration:none; background:#2563eb; color:#ffffff; padding:10px 18px; border-radius:6px; font-size:14px;">Hubungi Admin</a>
          </div>

          <hr style="margin-top:32px; border:none; border-top:1px solid #e5e7eb;">
          <p style="font-size:12px; color:#9ca3af; text-align:center;">
            Email ini dikirim otomatis oleh sistem Pelaporan Kerusakan. Mohon tidak membalas email ini.
          </p>
        </div>
      </div>
    `

    await resend.emails.send({
      from: "Pelaporan Kerusakan <onboarding@resend.dev>",
      to: userData.email,
      subject: "Laporan Kamu Berhasil Dikirim",
      html: emailContent,
    })

    return NextResponse.json({
      message: "Laporan berhasil dikirim dan notifikasi email terkirim",
    })
  } catch (err) {
    console.error("Error kirim laporan:", err)
    return NextResponse.json({ message: "Gagal kirim laporan" }, { status: 500 })
  }
}
