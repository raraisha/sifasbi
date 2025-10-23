import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

// PATCH → Update status laporan dan kirim email notifikasi
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id_pelaporan = params.id

    const rawBody = await request.text()
    if (!rawBody) return NextResponse.json({ message: 'Body request kosong' }, { status: 400 })

    const body = JSON.parse(rawBody)
    const { status, alasan } = body

    if (!status) return NextResponse.json({ message: 'Status wajib diisi' }, { status: 400 })

    // Ambil data laporan
    const { data: laporan, error: laporanError } = await supabase
      .from('pelaporan_kerusakan')
      .select('id_siswa, nama_barang, deskripsi')
      .eq('id_pelaporan', id_pelaporan)
      .single()

    if (laporanError || !laporan)
      return NextResponse.json({ message: 'Laporan tidak ditemukan' }, { status: 404 })

    const { id_siswa, nama_barang, deskripsi } = laporan

    // Ambil data user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('nama, email')
      .eq('nis', id_siswa)
      .single()

    if (userError || !user)
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 })

    // Update status laporan
    const updateData: any = { status }
    if (status === 'Ditolak') {
      updateData.alasan_penolakan = alasan && alasan.trim() !== '' ? alasan : '-'
    }

    const { error: updateError } = await supabase
      .from('pelaporan_kerusakan')
      .update(updateData)
      .eq('id_pelaporan', id_pelaporan)

    if (updateError)
      return NextResponse.json({ message: updateError.message }, { status: 500 })

    // Template email yang lebih menarik
    const emailHTML = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f9fafb; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <div style="background-color: #2563eb; padding: 16px 24px; color: white;">
          <h2 style="margin: 0;">📋 Notifikasi Pelaporan Kerusakan</h2>
        </div>
        <div style="padding: 24px;">
          <p>Halo <strong>${user.nama}</strong>,</p>
          <p>Status laporan kamu telah diperbarui menjadi 
            <span style="font-weight: bold; color: ${
              status === 'Selesai'
                ? '#16a34a'
                : status === 'Diproses'
                ? '#f59e0b'
                : status === 'Ditolak'
                ? '#dc2626'
                : '#374151'
            };">${status}</span>.
          </p>

          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 10px;">
            <p style="margin: 4px 0;"><strong>Barang:</strong> ${nama_barang}</p>
            <p style="margin: 4px 0;"><strong>Deskripsi:</strong> ${deskripsi}</p>
            ${
              status === 'Ditolak'
                ? `<p style="margin: 4px 0; color: #dc2626;"><strong>Alasan Penolakan:</strong> ${alasan || '-'}</p>`
                : ''
            }
          </div>

          <p style="margin-top: 20px;">Terima kasih sudah menggunakan sistem pelaporan kami. Kami akan selalu berusaha memberikan layanan terbaik untuk kamu.</p>

          <p style="margin-top: 32px; color: #6b7280; font-size: 13px;">Email ini dikirim otomatis oleh sistem pelaporan. Mohon tidak membalas pesan ini.</p>
        </div>
        <div style="background-color: #2563eb; padding: 12px; text-align: center; color: white; font-size: 14px;">
          © ${new Date().getFullYear()} Tim Pelaporan. Semua Hak Dilindungi.
        </div>
      </div>
    `

    // Kirim email
    await resend.emails.send({
      from: 'Pelaporan <onboarding@resend.dev>', // ganti nanti kalau domainmu udah diverifikasi
      to: user.email,
      subject: `Status Laporan Kamu: ${status}`,
      html: emailHTML,
    })

    return NextResponse.json(
      { message: 'Status berhasil diperbarui dan email dikirim' },
      { status: 200 }
    )
  } catch (err) {
    console.error('Handler error:', err)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

// GET → Ambil detail laporan
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id_pelaporan = params.id

    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .select('id_pelaporan, nama_barang, deskripsi, status, tanggal_lapor, alasan_penolakan')
      .eq('id_pelaporan', id_pelaporan)
      .single()

    if (error) return NextResponse.json({ message: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 })

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('Handler error:', err)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
