// app/api/users/route.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server only, jangan expose ke client
)

type User = {
  nis: number
  nama: string
  role: string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')

    let query = supabase.from('users').select('nis, nama, role')

    if (role) {
      query = query.eq('role', role)
    }

    const { data, error } = await query

    if (error) throw error

    return Response.json(data as User[])
  } catch (err) {
    console.error('API Error /users:', err)
    return Response.json({ error: 'Gagal mengambil data user' }, { status: 500 })
  }
}
