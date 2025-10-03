'use client'

import { useAuth } from './AuthProvider'
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  FileText, 
  Bell,
  Plus,
  Download,
  Upload,
  Zap
} from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick: () => void
  available: boolean
}

export default function QuickActions() {
  const { user } = useAuth()

  if (!user) return null

  const getActionsByRole = (role: string): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        title: 'New Reply',
        description: 'Send a quick reply to customers',
        icon: <MessageSquare className="w-5 h-5" />,
        color: 'bg-blue-500 hover:bg-blue-600',
        onClick: () => alert('Quick reply feature - Coming soon!'),
        available: true
      },
      {
        title: 'Mark All Read',
        description: 'Mark all messages as read',
        icon: <Bell className="w-5 h-5" />,
        color: 'bg-green-500 hover:bg-green-600',
        onClick: () => {
          // Call mark all read API
          fetch('/api/mark-all-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform: 'all' })
          }).then(() => {
            alert('All messages marked as read!')
            window.location.reload()
          })
        },
        available: true
      }
    ]

    const adminActions: QuickAction[] = [
      ...baseActions,
      {
        title: 'User Management',
        description: 'Manage staff and permissions',
        icon: <Users className="w-5 h-5" />,
        color: 'bg-purple-500 hover:bg-purple-600',
        onClick: () => alert('User management - Coming soon!'),
        available: ['admin', 'manager', 'direktur'].includes(role)
      },
      {
        title: 'Analytics',
        description: 'View performance metrics',
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'bg-indigo-500 hover:bg-indigo-600',
        onClick: () => window.open('/analytics', '_blank'),
        available: ['admin', 'manager', 'direktur'].includes(role)
      }
    ]

    const managerActions: QuickAction[] = [
      ...adminActions,
      {
        title: 'Generate Report',
        description: 'Create performance reports',
        icon: <FileText className="w-5 h-5" />,
        color: 'bg-orange-500 hover:bg-orange-600',
        onClick: () => alert('Report generation - Coming soon!'),
        available: ['manager', 'direktur'].includes(role)
      },
      {
        title: 'Export Data',
        description: 'Export customer data',
        icon: <Download className="w-5 h-5" />,
        color: 'bg-teal-500 hover:bg-teal-600',
        onClick: () => alert('Data export - Coming soon!'),
        available: ['manager', 'direktur'].includes(role)
      }
    ]

    const direkturActions: QuickAction[] = [
      ...managerActions,
      {
        title: 'System Settings',
        description: 'Configure system settings',
        icon: <Settings className="w-5 h-5" />,
        color: 'bg-red-500 hover:bg-red-600',
        onClick: () => alert('System settings - Coming soon!'),
        available: role === 'direktur'
      },
      {
        title: 'Bulk Import',
        description: 'Import customer data',
        icon: <Upload className="w-5 h-5" />,
        color: 'bg-amber-500 hover:bg-amber-600',
        onClick: () => alert('Bulk import - Coming soon!'),
        available: role === 'direktur'
      }
    ]

    switch (role) {
      case 'staff': return baseActions
      case 'admin': return adminActions
      case 'manager': return managerActions
      case 'direktur': return direkturActions
      default: return baseActions
    }
  }

  const actions = getActionsByRole(user.role).filter(action => action.available)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600">Shortcuts for {user.role} tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`p-4 rounded-lg text-white transition-all duration-200 transform hover:scale-105 ${action.color}`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              {action.icon}
              <div>
                <h3 className="font-medium text-sm">{action.title}</h3>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
