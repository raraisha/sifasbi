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
}, laporan: {
  gedung: string
  ruangan: string
  nama_barang: string
  deskripsi: string
  url_gambar: string | null
}) {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Kerusakan Diterima - SiFasBi</title>
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
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
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
      color: #dc2626;
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
      align-items: flex-start;
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
      max-width: 300px;
      word-wrap: break-word;
    }
    .image-container {
      margin: 20px 0;
      text-align: center;
    }
    .image-container img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
      color: #7f1d1d;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 14px;
      font-weight: 500;
    }
    .info-box {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border-left: 4px solid #dc2626;
      padding: 14px 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      color: #7f1d1d;
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
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      color: white;
      padding: 14px 36px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
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
      color: #dc2626;
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
        <div class="check-icon">📋</div>
        <h1>Laporan Kamu Diterima</h1>
        <p>Laporan sedang kami proses oleh tim maintenance</p>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="greeting">
        Halo <strong>${userData.nama}</strong>, laporan kerusakan kamu sudah berhasil dikirim dan sedang menunggu konfirmasi dari tim kami.
      </p>

      <!-- Status -->
      <div class="status-badge">
        ⏳ Status: <strong>Menunggu Konfirmasi</strong>
      </div>

      <!-- Details -->
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">🏢 Gedung</div>
          <div class="detail-value">${laporan.gedung}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">🚪 Ruangan</div>
          <div class="detail-value">${laporan.ruangan}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">📦 Barang</div>
          <div class="detail-value">${laporan.nama_barang || '-'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">📝 Deskripsi</div>
          <div class="detail-value">${laporan.deskripsi}</div>
        </div>
      </div>

      <!-- Gambar jika ada -->
      ${laporan.url_gambar ? `
        <div class="image-container">
          <img src="${laporan.url_gambar}" alt="Foto Kerusakan" style="max-width: 100%; border-radius: 8px;">
        </div>
      ` : ''}

      <!-- Info -->
      <div class="info-box">
        <strong>ℹ️ Informasi Penting</strong>
        Tim maintenance kami akan segera meninjau laporan Anda. Notifikasi akan dikirim melalui email ketika laporan telah dikonfirmasi dan perbaikan dimulai. Estimasi waktu respons: 1-2 hari kerja.
      </div>

      <!-- CTA -->
      <div class="cta-container">
        <a href="https://sifasbi.vercel.app/dashboard-siswa/histori" class="cta-button">Lihat Status Laporan</a>
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
      🔧 Sistem Pelaporan Kerusakan Barang Inventaris (SiFasBi)<br>
      Email ini dikirim otomatis, mohon tidak membalas email ini.
    </div>
  </div>
</body>
</html>
  `
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const id_siswa = formData.get("id_siswa")
    const gedung = formData.get("gedung")
    const ruangan = formData.get("ruangan")
    const nama_barang = formData.get("nama_barang")
    const deskripsi = formData.get("deskripsi")
    const foto = formData.get("foto")

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

    // === Setup SMTP (ganti kredensial di .env.local) ===
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // === Generate Email Content ===
    const emailContent = generateEmailTemplate(userData, {
      gedung,
      ruangan,
      nama_barang: nama_barang as string,
      deskripsi: deskripsi as string,
      url_gambar,
    })

    // === Kirim email ===
    await transporter.sendMail({
      from: `"SiFasBi - Pelaporan Kerusakan" <${process.env.SMTP_USER}>`,
      to: userData.email,
      subject: "📋 Laporan Kerusakan Kamu Berhasil Diterima - SiFasBi",
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