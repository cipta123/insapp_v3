'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, User, Shield, Crown, Star, Briefcase, ChevronDown } from 'lucide-react'

interface UserRole {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  description: string
}

const userRoles: UserRole[] = [
  {
    id: 'staff',
    name: 'Staff',
    icon: <User className="w-5 h-5" />,
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-blue-600',
    description: 'Customer Service Representative'
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-green-600',
    bgGradient: 'from-green-500 to-green-600',
    description: 'System Administrator'
  },
  {
    id: 'manager',
    name: 'Manager',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-purple-600',
    description: 'Department Manager'
  },
  {
    id: 'direktur',
    name: 'Direktur',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-amber-600',
    bgGradient: 'from-amber-500 to-amber-600',
    description: 'Executive Director'
  }
]

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>(userRoles[0])
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role: selectedRole.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        // Redirect to dashboard
        router.push('/')
      } else {
        alert(data.error || 'Login failed')
      }
      
    } catch (error) {
      console.error('Login error:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Subtle Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl blur opacity-20"></div>
        
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your customer service dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Role
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full bg-white border border-blue-200 rounded-lg px-4 py-3 text-left text-gray-800 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedRole.bgGradient}`}>
                      {selectedRole.icon}
                    </div>
                    <div>
                      <div className="font-medium">{selectedRole.name}</div>
                      <div className="text-xs text-gray-500">{selectedRole.description}</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Role Dropdown */}
                {showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-200 rounded-lg shadow-xl z-10 overflow-hidden">
                    {userRoles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role)
                          setShowRoleDropdown(false)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-all duration-200 flex items-center space-x-3 text-gray-800"
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${role.bgGradient}`}>
                          {role.icon}
                        </div>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-lg pl-10 pr-12 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className={`w-full bg-gradient-to-r ${selectedRole.bgGradient} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {selectedRole.icon}
                  <span>Sign In as {selectedRole.name}</span>
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Demo Credentials:</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-blue-600">
                  <span className="font-medium">Staff:</span> staff1 / staff123
                </div>
                <div className="text-green-600">
                  <span className="font-medium">Admin:</span> admin1 / admin123
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-purple-600">
                  <span className="font-medium">Manager:</span> manager1 / manager123
                </div>
                <div className="text-amber-600">
                  <span className="font-medium">Direktur:</span> direktur1 / direktur123
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Customer Service Management System
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Secure • Professional • Efficient
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
