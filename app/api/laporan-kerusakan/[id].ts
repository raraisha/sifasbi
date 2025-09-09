import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' })

  const { status } = req.body
  if (!status) return res.status(400).json({ message: 'Status wajib diisi' })

  try {
    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .update({ status })
      .eq('id_pelaporan', id)

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ message: error.message })
    }

    return res.status(200).json({ message: 'Status berhasil diupdate', data })
  } catch (error) {
    console.error('Handler error:', error)
    return res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}
