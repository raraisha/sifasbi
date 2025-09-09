import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  try {
    const { data, error } = await supabase
      .from('pelaporan_kerusakan')
      .select('*')
      .order('waktu_dibuat', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ message: error.message, code: error.code, hint: error.hint })
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Handler error:', error)
    return res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
}
