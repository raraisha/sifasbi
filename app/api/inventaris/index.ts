import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('fasilitas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      res.status(200).json(data)
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Gagal ambil data inventaris' })
    }
    return
  }

  if (req.method === 'POST') {
    try {
      const b = req.body
      const payload = {
        kode_inventaris: b.kode_inventaris,
        nama_fasilitas: b.nama_fasilitas,
        jumlah_unit: Number(b.jumlah_unit),
        jumlah_tersedia: Number(b.jumlah_tersedia),
        penanggungjawab: b.penanggungjawab,
        status: b.status,
        kategori: b.kategori,
        gedung: b.gedung,
        ruangan: b.ruangan,
      }

      const { data, error } = await supabase
        .from('fasilitas')
        .insert([payload])
        .select()

      if (error) throw error
      res.status(201).json(data?.[0] ?? null)
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Gagal tambah inventaris' })
    }
    return
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
