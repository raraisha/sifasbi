export async function sendWhatsAppMessage(target: string, message: string) {
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': process.env.FONNTE_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target, // nomor WA tujuan (628xxx)
        message, // isi pesan
      }),
    })

    const data = await res.json()
    console.log('Notifikasi WhatsApp:', data)
    return data
  } catch (err) {
    console.error('Gagal kirim WA:', err)
  }
}
