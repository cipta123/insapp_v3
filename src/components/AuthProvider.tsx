'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  username: string
  name: string
  email: string
  role: 'staff' | 'admin' | 'manager' | 'direktur'
}

interface AuthContextType {
  user: User | null
  login: (userData: User, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    console.log('🔍 AuthProvider: Checking localStorage...')
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    console.log('🔍 AuthProvider: userData exists:', !!userData)
    console.log('🔍 AuthProvider: token exists:', !!token)

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('✅ AuthProvider: Setting user:', parsedUser.name, `(${parsedUser.role})`)
        setUser(parsedUser)
      } catch (error) {
        console.error('❌ AuthProvider: Error parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }

    setIsLoading(false)
    console.log('🔍 AuthProvider: Initial check complete, isLoading set to false')
  }, [])

  useEffect(() => {
    // Redirect logic
    console.log('🔄 AuthProvider: Redirect logic check:', { user: !!user, isLoading, pathname })
    if (!isLoading) {
      if (!user && pathname !== '/login') {
        console.log('🔄 AuthProvider: Redirecting to login (no user)')
        router.push('/login')
      } else if (user && pathname === '/login') {
        console.log('🔄 AuthProvider: Redirecting to dashboard (user exists)')
        router.push('/')
      }
    }
  }, [user, isLoading, pathname, router])

  const login = (userData: User, token: string) => {
    console.log('🔐 AuthProvider: Login called with user:', userData.name, `(${userData.role})`)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
    console.log('🔐 AuthProvider: User state and localStorage updated, redirecting to dashboard')
    router.push('/')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
