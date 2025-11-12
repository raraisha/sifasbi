import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ===== [POST] Ajukan Peminjaman =====
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type harus application/json" },
        { status: 400 }
      )
    }

    const bodyText = await req.text()
    if (!bodyText) {
      return NextResponse.json({ error: "Body JSON kosong" }, { status: 400 })
    }

    let body: any
    try {
      body = JSON.parse(bodyText)
    } catch {
      return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 })
    }

    const {
      id_user,
      kode_inventaris,
      waktu_mulai,
      waktu_selesai,
      keperluan,
      status,
      nama_peminjam,
      nama_barang,
    } = body

    if (!id_user || !kode_inventaris || !waktu_mulai || !waktu_selesai) {
      return NextResponse.json(
        { error: "Field id_user, kode_inventaris, waktu_mulai, dan waktu_selesai wajib diisi." },
        { status: 400 }
      )
    }

    // === Ambil data user untuk email ===
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("nama, email")
      .eq("nis", id_user)
      .single()

    if (userError || !userData) {
      console.warn("User tidak ditemukan:", userError)
    }

    // === Insert ke tabel peminjaman ===
    const { data, error } = await supabase.from("peminjaman").insert([
      {
        id_user,
        kode_inventaris,
        tanggal_pengajuan: new Date().toISOString().split("T")[0],
        waktu_mulai,
        waktu_selesai,
        keperluan: keperluan || null,
        status: status || "Menunggu",
        nama_peminjam: nama_peminjam || userData?.nama || null,
        nama_barang: nama_barang || null,
      },
    ])

    if (error) throw error

    // === Kirim notifikasi email ===
    if (userData?.email) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      const emailContent = `
        <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color:#2563eb; text-align:center;">Peminjaman Berhasil Diajukan ✅</h2>
            <p style="font-size:15px; color:#374151;">Halo <strong>${userData.nama}</strong>, pengajuan peminjaman kamu sudah berhasil dikirim.</p>
            <table style="width:100%; font-size:14px; color:#4b5563; margin-top:16px;">
              <tr><td style="padding:6px 0;">Barang</td><td><strong>${nama_barang || "-"}</strong></td></tr>
              <tr><td style="padding:6px 0;">Kode Inventaris</td><td>${kode_inventaris}</td></tr>
              <tr><td style="padding:6px 0;">Waktu Mulai</td><td>${waktu_mulai}</td></tr>
              <tr><td style="padding:6px 0;">Waktu Selesai</td><td>${waktu_selesai}</td></tr>
              <tr><td style="padding:6px 0;">Status</td><td><span style="background:#fef9c3; color:#854d0e; padding:3px 8px; border-radius:6px;">Menunggu</span></td></tr>
            </table>
            <div style="margin-top:24px; text-align:center;">
              <a href="mailto:${process.env.SMTP_USER}" style="background:#2563eb; color:white; padding:10px 16px; border-radius:6px; text-decoration:none;">Hubungi Admin</a>
            </div>
            <p style="font-size:12px; color:#9ca3af; text-align:center; margin-top:20px;">Email ini dikirim otomatis oleh SiFasBi.</p>
          </div>
        </div>
      `

      await transporter.sendMail({
        from: `"Sistem Peminjaman" <${process.env.SMTP_USER}>`,
        to: userData.email,
        subject: "Peminjaman Kamu Berhasil Diajukan",
        html: emailContent,
      })
    }

    return NextResponse.json({
      message: "Peminjaman berhasil diajukan dan notifikasi email dikirim",
      data,
    })
  } catch (err) {
    console.error("Error ajukan peminjaman:", err)
    return NextResponse.json({ error: "Gagal mengajukan peminjaman." }, { status: 500 })
  }
}

// ===== [GET] Ambil Daftar Peminjaman Berdasarkan NIS / ID User =====
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nis = searchParams.get("nis")

  if (!nis) {
    return NextResponse.json({ error: "NIS wajib dikirim." }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select("*")
      .or(`id_user.eq.${nis},nis.eq.${nis}`)

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error("Error ambil data peminjaman:", err)
    return NextResponse.json({ error: "Gagal mengambil data peminjaman." }, { status: 500 })
  }
}
