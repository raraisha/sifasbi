'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [nis, setNis] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis, password }),
      })
      const data = await res.json()
      if(data.message === "ID atau password salah"){
        return alert("ID atau password salah");
      }
      if (!res.ok) {
        setError(data.message || 'Terjadi kesalahan login')
        return
      }

      // Simpan user di localStorage
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect sesuai role
      switch (data.role) {
        case 'siswa':
          router.push('/dashboard-siswa/dashboard')
          break
        case 'guru':
          router.push('/dashboard-guru')
          break
        case 'admin':
          router.push('/ADMIN/dashboard-admin')
          break
        default:
          alert('Role tidak dikenali!')
      }
    } catch (err) {
      console.error('Login frontend error:', err)
      setError('Terjadi kesalahan server. Coba lagi nanti.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mb-4" />
          <h1 className="text-2xl font-bold text-center">
            <span className="text-[#B36FF2]">Si</span>
            <span className="text-[#273B98]">FasBi</span>
          </h1>
          <p className="text-center text-gray-500 text-sm mt-2">
            Book the spaces and equipment you need to support your learning activities.
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold text-black">NIS / NIK</label>
            <input
              type="text"
              placeholder="Ex. 201401.."
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-black">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ex. Ax7@gpI0.."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          © SMK Bina Informatika 2025. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}
