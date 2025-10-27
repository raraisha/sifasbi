import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id_user, nama_barang, waktu_mulai, waktu_selesai, keperluan } = body

    if (!id_user || !nama_barang || !waktu_mulai || !waktu_selesai || !keperluan) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 })
    }

    // Ambil data user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("nama, email, nis")
      .eq("nis", id_user)
      .single()

    if (userError || !userData) {
      return NextResponse.json({
        message: "Request tersimpan, tapi gagal kirim notifikasi email",
      })
    }

    // Simpan ke req_peminjaman
    const { error: insertError } = await supabase.from("req_peminjaman").insert([
      {
        id_user: userData.nis,
        nama_peminjam: userData.nama,
        nama_barang,
        waktu_mulai,
        waktu_selesai,
        keperluan,
        status: "Request",
      },
    ])
    if (insertError) throw insertError

    // Setup SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Template email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:24px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align:center;">
            <h1 style="color:#2563eb; margin-bottom:8px;">Request Peminjaman Kamu Diterima ✅</h1>
            <p style="color:#4b5563; font-size:15px;">Halo <strong>${userData.nama}</strong>, request peminjaman barang kamu berhasil dikirim dan menunggu konfirmasi admin.</p>
          </div>
          <div style="margin-top:24px;">
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tr><td style="padding:8px 0; color:#6b7280;">Barang</td><td><strong>${nama_barang}</strong></td></tr>
              <tr><td style="padding:8px 0; color:#6b7280;">Tanggal Pinjam</td><td>${waktu_mulai}</td></tr>
              <tr><td style="padding:8px 0; color:#6b7280;">Tanggal Kembali</td><td>${waktu_selesai}</td></tr>
              <tr><td style="padding:8px 0; color:#6b7280;">Keperluan</td><td>${keperluan}</td></tr>
              <tr><td style="padding:8px 0; color:#6b7280;">Status</td><td><span style="background:#fef9c3; color:#854d0e; padding:4px 10px; border-radius:6px; font-weight:600;">Request</span></td></tr>
            </table>
          </div>
          <div style="margin-top:24px; text-align:center;">
            <a href="mailto:${process.env.SMTP_USER}" style="text-decoration:none; background:#2563eb; color:#ffffff; padding:10px 18px; border-radius:6px; font-size:14px;">Hubungi Admin</a>
          </div>
          <hr style="margin-top:32px; border:none; border-top:1px solid #e5e7eb;">
          <p style="font-size:12px; color:#9ca3af; text-align:center;">
            Email ini dikirim otomatis oleh sistem SIFASBI. Mohon tidak membalas email ini.
          </p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"SIFASBI" <${process.env.SMTP_USER}>`,
      to: userData.email,
      subject: "Request Peminjaman Berhasil",
      html: emailContent,
    })

    return NextResponse.json({ message: "Request berhasil dikirim dan email notif terkirim" })
  } catch (err) {
    console.error("Error request peminjaman:", err)
    return NextResponse.json({ message: "Gagal kirim request", error: err }, { status: 500 })
  }
}
