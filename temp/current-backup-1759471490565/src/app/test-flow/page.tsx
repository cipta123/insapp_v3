'use client'

import { useEffect, useState } from 'react'

export default function TestFlowPage() {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [results, setResults] = useState<Array<{time: string, message: string, type: string}>>([])

  const log = (message: string, type: string = 'info') => {
    const newResult = {
      time: new Date().toLocaleTimeString(),
      message,
      type
    }
    setResults(prev => [...prev, newResult])
    console.log(message)
  }

  const updateStatus = () => {
    const userData = localStorage.getItem('user')
    const tokenData = localStorage.getItem('token')
    
    setUser(userData ? JSON.parse(userData) : null)
    setToken(tokenData)
  }

  const testLogin = async () => {
    log('🔐 Testing login API...', 'info')
    
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
        log('✅ Login API successful!', 'success')
        log(`👤 User: ${data.user.name} (${data.user.role})`, 'success')
        
        // Manually set localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        
        log('💾 Saved to localStorage', 'success')
        updateStatus()
      } else {
        log(`❌ Login failed: ${data.error}`, 'error')
      }
      
    } catch (error: any) {
      log(`❌ Network error: ${error.message}`, 'error')
    }
  }

  const clearStorage = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    log('🗑️ localStorage cleared', 'info')
    updateStatus()
  }

  const checkStorage = () => {
    const userData = localStorage.getItem('user')
    const tokenData = localStorage.getItem('token')
    
    if (userData && tokenData) {
      try {
        const parsedUser = JSON.parse(userData)
        log(`✅ Valid user data found: ${parsedUser.name} (${parsedUser.role})`, 'success')
      } catch (e) {
        log('❌ Invalid user data in localStorage', 'error')
      }
    } else {
      log('ℹ️ No user data in localStorage', 'info')
    }
    updateStatus()
  }

  useEffect(() => {
    updateStatus()
    log('🚀 Test page loaded', 'info')
  }, [])

  const getResultClass = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-300 text-green-800'
      case 'error': return 'bg-red-100 border-red-300 text-red-800'
      default: return 'bg-blue-100 border-blue-300 text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔐 Authentication Flow Test</h1>
        
        {/* Current Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>localStorage user:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user ? 'EXISTS' : 'NULL'}
              </span>
            </div>
            <div>
              <strong>localStorage token:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {token ? `EXISTS (${token.length} chars)` : 'NULL'}
              </span>
            </div>
            <div>
              <strong>Current URL:</strong>
              <span className="ml-2 text-sm text-gray-600">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</span>
            </div>
          </div>
          
          {user && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <strong>User Details:</strong>
              <div className="text-sm mt-1">
                <div>Name: {user.name}</div>
                <div>Username: {user.username}</div>
                <div>Role: {user.role}</div>
                <div>Email: {user.email}</div>
              </div>
            </div>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔐 Test Login API
            </button>
            <button
              onClick={clearStorage}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              🗑️ Clear localStorage
            </button>
            <button
              onClick={checkStorage}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              🔍 Check localStorage
            </button>
            <a
              href="/login"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block"
            >
              ➡️ Go to Login Page
            </a>
            <a
              href="/"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 inline-block"
            >
              ➡️ Go to Dashboard
            </a>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 border rounded ${getResultClass(result.type)}`}
              >
                <strong>{result.time}:</strong> {result.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
