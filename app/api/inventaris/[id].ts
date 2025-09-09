import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('fasilitas')
        .select('*')
        .eq('id_fasilitas', id)
        .single()

      if (error) throw error
      res.status(200).json(data)
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Gagal ambil detail inventaris' })
    }
    return
  }

  if (req.method === 'PATCH') {
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
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('fasilitas')
        .update(payload)
        .eq('id_fasilitas', id)
        .select()

      if (error) throw error
      res.status(200).json(data?.[0] ?? null)
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Gagal update inventaris' })
    }
    return
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('fasilitas')
        .delete()
        .eq('id_fasilitas', id)

      if (error) throw error
      res.status(200).json({ message: 'Inventaris berhasil dihapus' })
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Gagal hapus inventaris' })
    }
    return
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
