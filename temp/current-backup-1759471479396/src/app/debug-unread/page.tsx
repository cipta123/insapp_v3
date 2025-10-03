'use client'

import { useState, useEffect } from 'react'

interface UnreadItem {
  id: string
  text?: string
  messageId?: string
  commentId?: string
  senderId?: string
  username?: string
  conversationId?: string
  isRead?: boolean
  isReplied?: boolean
  isFromBusiness?: boolean
  createdAt?: string
  timestamp?: string
}

interface DebugData {
  summary: {
    totalUnread: number
    breakdown: {
      instagramDM: number
      instagramComments: number
      whatsapp: number
    }
  }
  details: {
    instagramDM: {
      total: number
      unread: UnreadItem[]
      unreadCount: number
    }
    instagramComments: {
      total: number
      unread: UnreadItem[]
      unreadCount: number
    }
    whatsapp: {
      total: number
      unread: UnreadItem[]
      unreadCount: number
    }
  }
}

export default function DebugUnreadPage() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const loadDebugData = async () => {
    try {
      const response = await fetch('/api/debug-unread')
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Error loading debug data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    setMarking(true)
    try {
      const response = await fetch('/api/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'all' })
      })
      
      const result = await response.json()
      alert(`✅ Success: ${result.message}`)
      
      // Reload data
      loadDebugData()
    } catch (error) {
      console.error('Error marking as read:', error)
      alert('❌ Error marking messages as read')
    } finally {
      setMarking(false)
    }
  }

  useEffect(() => {
    loadDebugData()
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadDebugData, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading debug data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Unread Messages</h1>
        
        {debugData && (
          <>
            {/* Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <div className="text-lg">
                <div className="font-bold text-2xl text-red-600 mb-2">
                  Total Unread: {debugData.summary.totalUnread}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>📱 Instagram DM: {debugData.summary.breakdown.instagramDM}</div>
                  <div>💬 Instagram Comments: {debugData.summary.breakdown.instagramComments}</div>
                  <div>🟢 WhatsApp: {debugData.summary.breakdown.whatsapp}</div>
                </div>
              </div>
            </div>

            {/* Mark All Read Button */}
            <button
              onClick={markAllRead}
              disabled={marking}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold mb-6 disabled:opacity-50"
            >
              {marking ? 'Marking...' : '✅ Mark All As Read'}
            </button>

            {/* Instagram DM */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-blue-600 mb-4">📱 Instagram DM</h3>
              {debugData.details.instagramDM.unread.length > 0 ? (
                <div className="space-y-3">
                  {debugData.details.instagramDM.unread.map((msg, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <div><strong>ID:</strong> {msg.id}</div>
                      <div><strong>Text:</strong> {msg.text}</div>
                      <div><strong>Sender:</strong> {msg.senderId}</div>
                      <div><strong>Created:</strong> {new Date(msg.createdAt || '').toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600">✅ All Instagram DM messages are read</p>
              )}
            </div>

            {/* Instagram Comments */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-purple-600 mb-4">💬 Instagram Comments</h3>
              {debugData.details.instagramComments.unread.length > 0 ? (
                <div className="space-y-3">
                  {debugData.details.instagramComments.unread.map((comment, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <div><strong>ID:</strong> {comment.id}</div>
                      <div><strong>Text:</strong> {comment.text}</div>
                      <div><strong>Username:</strong> {comment.username}</div>
                      <div><strong>Created:</strong> {new Date(comment.createdAt || '').toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600">✅ All Instagram Comments are replied</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-600 mb-4">🟢 WhatsApp</h3>
              {debugData.details.whatsapp.unread.length > 0 ? (
                <div className="space-y-3">
                  {debugData.details.whatsapp.unread.map((msg, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <div><strong>ID:</strong> {msg.id}</div>
                      <div><strong>Text:</strong> {msg.text}</div>
                      <div><strong>From:</strong> {msg.conversationId}</div>
                      <div><strong>Time:</strong> {new Date(msg.timestamp || '').toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600">✅ All WhatsApp messages are read</p>
              )}
            </div>

            {/* Refresh Info */}
            <div className="text-center text-gray-500 text-sm">
              Auto-refreshing every 5 seconds...
            </div>
          </>
        )}
      </div>
    </div>
  )
}
