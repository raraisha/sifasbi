import nodemailer from "nodemailer"

export async function POST(req) {
  const { to, subject, text, html } = await req.json()

  // Konfigurasi SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Ganti sesuai provider kamu
    port: 465, // 465 (SSL) atau 587 (TLS)
    secure: true, // true kalau port 465
    auth: {
      user: process.env.SMTP_USER, // email kamu
      pass: process.env.SMTP_PASS, // app password Gmail
    },
  })

  try {
    const info = await transporter.sendMail({
      from: `"My App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })

    return Response.json({ success: true, info })
  } catch (error) {
    console.error("Error sending email:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
