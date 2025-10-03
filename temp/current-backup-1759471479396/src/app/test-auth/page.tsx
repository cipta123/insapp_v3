'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

export default function TestAuthPage() {
  const { user, login, logout } = useAuth()
  const [localStorageData, setLocalStorageData] = useState<any>(null)

  useEffect(() => {
    // Check localStorage data
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    setLocalStorageData({
      user: userData ? JSON.parse(userData) : null,
      token: token ? token.substring(0, 50) + '...' : null,
      hasUser: !!userData,
      hasToken: !!token
    })
  }, [])

  const handleTestLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'direktur1',
          password: 'direktur123'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ API Login successful, calling AuthProvider login...')
        login(data.user, data.token)
      } else {
        console.log('❌ API Login failed:', data.error)
      }
    } catch (error) {
      console.error('❌ Network error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        {/* AuthProvider State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">AuthProvider State</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? `${user.name} (${user.role})` : 'null'}</p>
            <p><strong>User ID:</strong> {user?.id || 'null'}</p>
            <p><strong>Username:</strong> {user?.username || 'null'}</p>
          </div>
        </div>

        {/* localStorage Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">localStorage Data</h2>
          {localStorageData && (
            <div className="space-y-2">
              <p><strong>Has User Data:</strong> {localStorageData.hasUser ? '✅' : '❌'}</p>
              <p><strong>Has Token:</strong> {localStorageData.hasToken ? '✅' : '❌'}</p>
              {localStorageData.user && (
                <>
                  <p><strong>Stored User:</strong> {localStorageData.user.name} ({localStorageData.user.role})</p>
                  <p><strong>Stored Username:</strong> {localStorageData.user.username}</p>
                </>
              )}
              {localStorageData.token && (
                <p><strong>Token Preview:</strong> {localStorageData.token}</p>
              )}
            </div>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleTestLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test API Login
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="space-x-4">
            <a href="/login" className="text-blue-500 hover:underline">Go to Login</a>
            <a href="/" className="text-blue-500 hover:underline">Go to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  )
}
