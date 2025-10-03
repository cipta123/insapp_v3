'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { 
  Settings, 
  Database, 
  Download, 
  Upload, 
  Shield, 
  Clock, 
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader,
  FileText,
  Trash2,
  RefreshCw,
  RotateCcw
} from 'lucide-react'

interface BackupItem {
  id: string
  name: string
  date: string
  size: string
  type: 'complete' | 'database' | 'files'
  status: 'success' | 'failed' | 'in_progress'
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('backup')
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [restoreStatus, setRestoreStatus] = useState('')
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [backupStatus, setBackupStatus] = useState('')
  const [systemStats, setSystemStats] = useState({
    totalMessages: 0,
    totalComments: 0,
    totalWhatsApp: 0,
    lastBackup: null as string | null
  })

  // Check if user has admin privileges
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'direktur'

  useEffect(() => {
    if (hasAdminAccess) {
      fetchBackupHistory()
      fetchSystemStats()
    }
  }, [hasAdminAccess])

  const fetchBackupHistory = async () => {
    try {
      const response = await fetch('/api/backup/history')
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups || [])
      }
    } catch (error) {
      console.error('Failed to fetch backup history:', error)
    }
  }

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/backup/stats')
      if (response.ok) {
        const data = await response.json()
        setSystemStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error)
    }
  }

  const createBackup = async (type: 'complete' | 'database' | 'files') => {
    setIsCreatingBackup(true)
    setBackupProgress(0)
    setBackupStatus('Initializing backup...')

    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        // Simulate progress updates
        const progressSteps = [
          { progress: 20, status: 'Backing up database...' },
          { progress: 40, status: 'Copying source files...' },
          { progress: 60, status: 'Backing up configurations...' },
          { progress: 80, status: 'Creating restore scripts...' },
          { progress: 100, status: 'Backup completed successfully!' }
        ]

        for (const step of progressSteps) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          setBackupProgress(step.progress)
          setBackupStatus(step.status)
        }

        await fetchBackupHistory()
      } else {
        throw new Error('Backup failed')
      }
    } catch (error) {
      setBackupStatus('Backup failed: ' + (error as Error).message)
    } finally {
      setIsCreatingBackup(false)
      setTimeout(() => {
        setBackupProgress(0)
        setBackupStatus('')
      }, 3000)
    }
  }

  const downloadBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/backup/download/${backupId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup-${backupId}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download backup:', error)
    }
  }

  const deleteBackup = async (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      try {
        const response = await fetch(`/api/backup/delete/${backupId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          await fetchBackupHistory()
        }
      } catch (error) {
        console.error('Failed to delete backup:', error)
      }
    }
  }

  const restoreBackup = async (backupId: string, type: string) => {
    const confirmMessage = `⚠️ WARNING: This will restore your system from backup "${backupId}".

${type === 'complete' ? '• Database will be completely replaced' : ''}
${type === 'database' ? '• Database will be completely replaced' : ''}
${type === 'files' ? '• Source files will be replaced' : ''}

Current data will be LOST. Are you absolutely sure?`

    if (confirm(confirmMessage)) {
      setIsRestoring(true)
      setRestoreProgress(0)
      setRestoreStatus('Preparing restore...')

      try {
        const response = await fetch('/api/backup/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backupId, type })
        })

        if (response.ok) {
          // Simulate progress updates
          const progressSteps = [
            { progress: 25, status: 'Stopping services...' },
            { progress: 50, status: 'Restoring database...' },
            { progress: 75, status: 'Restoring files...' },
            { progress: 100, status: 'Restore completed! Please refresh the page.' }
          ]

          for (const step of progressSteps) {
            await new Promise(resolve => setTimeout(resolve, 1500))
            setRestoreProgress(step.progress)
            setRestoreStatus(step.status)
          }

          // Refresh stats after restore
          setTimeout(() => {
            fetchSystemStats()
            fetchBackupHistory()
          }, 2000)
        } else {
          throw new Error('Restore failed')
        }
      } catch (error) {
        setRestoreStatus('Restore failed: ' + (error as Error).message)
      } finally {
        setIsRestoring(false)
        setTimeout(() => {
          setRestoreProgress(0)
          setRestoreStatus('')
        }, 5000)
      }
    }
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Manage backups, restore data, and system configuration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('backup')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'backup'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Database className="h-5 w-5" />
                <span>Backup & Restore</span>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'history'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-5 w-5" />
                <span>Backup History</span>
              </button>

              <button
                onClick={() => setActiveTab('system')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'system'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <HardDrive className="h-5 w-5" />
                <span>System Info</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'backup' && (
              <div className="space-y-6">
                {/* System Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Instagram Messages</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats.totalMessages.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Database className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">WhatsApp Messages</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats.totalWhatsApp.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <Database className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Comments</p>
                        <p className="text-2xl font-bold text-gray-900">{systemStats.totalComments.toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backup Creation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Backup</h3>
                  
                  {(isCreatingBackup || isRestoring) && (
                    <div className={`mb-6 p-4 rounded-lg border ${
                      isRestoring 
                        ? 'bg-orange-50 border-orange-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <Loader className={`h-5 w-5 animate-spin ${
                          isRestoring ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                        <span className={`font-medium ${
                          isRestoring ? 'text-orange-800' : 'text-blue-800'
                        }`}>
                          {isRestoring ? restoreStatus : backupStatus}
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${
                        isRestoring ? 'bg-orange-200' : 'bg-blue-200'
                      }`}>
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isRestoring ? 'bg-orange-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${isRestoring ? restoreProgress : backupProgress}%` }}
                        ></div>
                      </div>
                      <div className={`text-right text-sm mt-1 ${
                        isRestoring ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {isRestoring ? restoreProgress : backupProgress}%
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => createBackup('complete')}
                      disabled={isCreatingBackup}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Database className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Complete Backup</h4>
                      <p className="text-sm text-gray-600">Database + Files + Scripts</p>
                    </button>

                    <button
                      onClick={() => createBackup('database')}
                      disabled={isCreatingBackup}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HardDrive className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Database Only</h4>
                      <p className="text-sm text-gray-600">Messages + Users + Settings</p>
                    </button>

                    <button
                      onClick={() => createBackup('files')}
                      disabled={isCreatingBackup}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Files Only</h4>
                      <p className="text-sm text-gray-600">Source Code + Config</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
                    <button
                      onClick={fetchBackupHistory}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {backups.length === 0 ? (
                    <div className="p-8 text-center">
                      <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No backups found. Create your first backup above.</p>
                    </div>
                  ) : (
                    backups.map((backup) => (
                      <div key={backup.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              backup.status === 'success' ? 'bg-green-100' :
                              backup.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                              {backup.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                              {backup.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
                              {backup.status === 'in_progress' && <Loader className="h-5 w-5 text-yellow-600 animate-spin" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{backup.name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{backup.date}</span>
                                <span>{backup.size}</span>
                                <span className="capitalize">{backup.type}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => restoreBackup(backup.id, backup.type)}
                              disabled={isRestoring || isCreatingBackup}
                              className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Restore from this backup"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => downloadBackup(backup.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteBackup(backup.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Database Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Instagram Messages:</span>
                          <span className="font-medium">{systemStats.totalMessages.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">WhatsApp Messages:</span>
                          <span className="font-medium">{systemStats.totalWhatsApp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comments:</span>
                          <span className="font-medium">{systemStats.totalComments.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Backup Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Backup:</span>
                          <span className="font-medium">
                            {systemStats.lastBackup ? new Date(systemStats.lastBackup).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Backups:</span>
                          <span className="font-medium">{backups.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
