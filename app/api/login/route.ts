import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const body = await request.json();
  const { nis, password } = body;
  try {
    // cek users (siswa & guru)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('nis', nis)
      .eq('password', password)

    if (userError) throw userError
    if (userData && userData.length > 0) {
      // return response.status(200).json({ user: userData[0],  })
      return new Response(JSON.stringify({
        user : userData[0],
        role: userData[0].role.toLowerCase()
      }));
    }

    // cek admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('nik', nis)
      .eq('password', password)

    if (adminError) throw adminError
    console.log(adminData)
    if (adminData && adminData.length > 0) {
      return new Response(JSON.stringify({
        user : adminData[0],
        role: adminData[0].role.toLowerCase()
      }));
    }

    return new Response(JSON.stringify({
        message : "ID atau password salah"
      }));
  } catch (err) {
    console.error('Login error:', err)
   return new Response(JSON.stringify({
        message : "Telah Terjadi Kesalahan Server"
      }));
  }
}