'use client'

import { useRouter } from 'next/navigation'
import { FiLogOut } from 'react-icons/fi'
import { createClient } from '@supabase/supabase-js'

// inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // logout Supabase Auth
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
      return
    }
    // redirect ke halaman login
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 flex items-center gap-2 mb-4 hover:underline"
    >
      <FiLogOut /> Logout
    </button>
  )
}
