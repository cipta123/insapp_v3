'use client'

import { useState, useEffect } from 'react'
import { Database, FileText, Folder, Download, RefreshCw, CheckCircle, AlertCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BackupFile {
  name: string
  type: 'database' | 'files' | 'complete'
  date: string
  size: string
  description: string
  files: string[]
  records?: {
    users: number
    messages: number
    comments: number
    posts: number
    whatsapp: number
    contacts: number
  }
}

interface RestoreStatus {
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
  progress: number
  currentFile?: string
}

export default function RestorePage() {
  const [backups, setBackups] = useState<BackupFile[]>([])
  const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null)
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>({
    status: 'idle',
    message: '',
    progress: 0
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/restore/list')
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups)
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
    }
  }

  const handleRestore = async (backup: BackupFile) => {
    if (!confirm(`Are you sure you want to restore from ${backup.name}? This will overwrite current data.`)) {
      return
    }

    setRestoreStatus({
      status: 'loading',
      message: 'Starting restore process...',
      progress: 0
    })

    try {
      const response = await fetch('/api/restore/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupName: backup.name, backupType: backup.type })
      })

      if (response.ok) {
        // Simulate progress for better UX
        const progressSteps = [
          { progress: 20, message: 'Preparing restore...', file: 'Database connection' },
          { progress: 40, message: 'Restoring database...', file: 'SystemUser, Messages, Comments' },
          { progress: 60, message: 'Restoring files...', file: 'Components, API routes' },
          { progress: 80, message: 'Updating schema...', file: 'Prisma schema' },
          { progress: 100, message: 'Restore completed successfully!', file: 'All files restored' }
        ]

        for (const step of progressSteps) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          setRestoreStatus({
            status: 'loading',
            message: step.message,
            progress: step.progress,
            currentFile: step.file
          })
        }

        setRestoreStatus({
          status: 'success',
          message: 'Restore completed successfully! Please restart the application.',
          progress: 100
        })
      } else {
        const error = await response.json()
        setRestoreStatus({
          status: 'error',
          message: error.message || 'Restore failed',
          progress: 0
        })
      }
    } catch (error) {
      setRestoreStatus({
        status: 'error',
        message: 'Network error during restore',
        progress: 0
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getBackupIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="h-6 w-6 text-blue-500" />
      case 'files': return <Folder className="h-6 w-6 text-green-500" />
      case 'complete': return <FileText className="h-6 w-6 text-purple-500" />
      default: return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Restore</h1>
                <p className="text-gray-600">Restore your application from previous backups</p>
              </div>
            </div>
            <button
              onClick={fetchBackups}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Restore Status */}
        {restoreStatus.status !== 'idle' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              {getStatusIcon(restoreStatus.status)}
              <h2 className="text-lg font-semibold">Restore Status</h2>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700">{restoreStatus.message}</p>
              
              {restoreStatus.status === 'loading' && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${restoreStatus.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Progress: {restoreStatus.progress}%
                    {restoreStatus.currentFile && ` - ${restoreStatus.currentFile}`}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Available Backups */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Backups</h2>
          
          <div className="grid gap-4">
            {backups.map((backup, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getBackupIcon(backup.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{backup.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{backup.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>📅 {backup.date}</span>
                        <span>📦 {backup.size}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          backup.type === 'complete' ? 'bg-purple-100 text-purple-700' :
                          backup.type === 'database' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {backup.type.toUpperCase()}
                        </span>
                      </div>

                      {/* Database Records Summary */}
                      {backup.records && (
                        <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">{backup.records.users}</div>
                            <div className="text-xs text-gray-600">Users</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">{backup.records.messages}</div>
                            <div className="text-xs text-gray-600">Messages</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">{backup.records.whatsapp}</div>
                            <div className="text-xs text-gray-600">WhatsApp</div>
                          </div>
                        </div>
                      )}

                      {/* Files Preview */}
                      <div className="mb-3">
                        <button
                          onClick={() => setSelectedBackup(selectedBackup?.name === backup.name ? null : backup)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {selectedBackup?.name === backup.name ? 'Hide' : 'Show'} Files ({backup.files.length})
                        </button>
                        
                        {selectedBackup?.name === backup.name && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                              {backup.files.map((file, fileIndex) => (
                                <div key={fileIndex} className="flex items-center space-x-2 text-sm">
                                  <FileText className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-700 truncate">{file}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRestore(backup)}
                      disabled={restoreStatus.status === 'loading'}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Restore</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {backups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No backups found</p>
              <p className="text-sm">Create a backup first to see restore options</p>
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Important Notice</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Restoring will overwrite your current data. Make sure to create a backup of your current state before proceeding.
                After restore, you may need to restart the application for changes to take effect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
