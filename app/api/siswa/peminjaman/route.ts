import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ===== [FUNCTION] Generate Email Template yang Bagus =====
function generateEmailTemplate(userData: {
  nama: string
}, peminjaman: {
  nama_barang: string
  kode_inventaris: string
  waktu_mulai: string
  waktu_selesai: string
}) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Peminjaman - SiFasBi</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: #0f172a;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
    }
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 50px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -40%;
      left: -5%;
      width: 250px;
      height: 250px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .check-icon {
      font-size: 50px;
      margin-bottom: 16px;
      animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }
    .header h1 {
      color: white;
      font-size: 28px;
      margin: 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.95);
      font-size: 14px;
      margin: 10px 0 0 0;
    }
    .body {
      padding: 40px 30px;
    }
    .greeting {
      color: #1f2937;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 28px 0;
    }
    .greeting strong {
      color: #1e40af;
    }
    .details-grid {
      display: grid;
      gap: 0;
      background: #f8fafc;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .detail-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 120px;
    }
    .detail-value {
      color: #0f172a;
      font-size: 15px;
      font-weight: 500;
      margin-left: auto;
      text-align: right;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 14px;
      font-weight: 500;
    }
    .info-box {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-left: 4px solid #1e40af;
      padding: 14px 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      color: #1e40af;
      font-size: 13px;
      line-height: 1.6;
    }
    .info-box strong {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .cta-container {
      text-align: center;
      margin-bottom: 24px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 14px 36px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(30, 64, 175, 0.4);
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 24px 0;
    }
    .footer-text {
      color: #94a3b8;
      font-size: 12px;
      line-height: 1.5;
      text-align: center;
      margin: 0;
    }
    .footer-text a {
      color: #1e40af;
      text-decoration: none;
      font-weight: 500;
    }
    .footer-text a:hover {
      text-decoration: underline;
    }
    .footer {
      background: #f8fafc;
      padding: 20px 30px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="check-icon">✅</div>
        <h1>Peminjaman Berhasil Diajukan</h1>
        <p>Ajuan Anda sedang kami proses</p>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">
        Halo <strong>${userData.nama}</strong>, pengajuan peminjaman kamu sudah berhasil dikirim dan kami akan segera memeriksanya.
      </p>

      <!-- Status -->
      <div class="status-badge">
        ⏳ Status: <strong>Menunggu Persetujuan</strong>
      </div>

      <!-- Details -->
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">📦 Barang</div>
          <div class="detail-value">${peminjaman.nama_barang || '-'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">🔖 Kode Inventaris</div>
          <div class="detail-value" style="font-family: 'Courier New', monospace;">${peminjaman.kode_inventaris}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">📅 Waktu Mulai</div>
          <div class="detail-value">${peminjaman.waktu_mulai}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">⏱️ Waktu Selesai</div>
          <div class="detail-value">${peminjaman.waktu_selesai}</div>
        </div>
      </div>

      <!-- Info -->
      <div class="info-box">
        <strong>ℹ️ Informasi Penting</strong>
        Admin akan memeriksa ajuan Anda dan mengirimkan notifikasi melalui email ketika ajuan telah disetujui atau ditolak. Proses persetujuan biasanya memakan waktu 1-2 hari kerja.
      </div>

      <!-- CTA -->
      <div class="cta-container">
        <a href="https://sifasbi.vercel.app/dashboard-siswa/histori" class="cta-button">Lihat Riwayat Peminjaman</a>
      </div>

      <div class="divider"></div>

      <!-- Contact -->
      <p class="footer-text">
        Ada pertanyaan? <a href="mailto:admin@example.com">Hubungi Admin</a><br>
        atau kunjungi portal SiFasBi untuk info lebih lanjut.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      🔒 Sistem Informasi Peminjaman Barang Inventaris (SiFasBi)<br>
      Email ini dikirim otomatis, mohon tidak membalas email ini.
    </div>
  </div>
</body>
</html>
  `
}

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

      const emailContent = generateEmailTemplate(userData, {
        nama_barang: nama_barang || "-",
        kode_inventaris,
        waktu_mulai,
        waktu_selesai,
      })

      await transporter.sendMail({
        from: `"SiFasBi - Sistem Peminjaman" <${process.env.SMTP_USER}>`,
        to: userData.email,
        subject: "✅ Peminjaman Anda Berhasil Diajukan - SiFasBi",
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