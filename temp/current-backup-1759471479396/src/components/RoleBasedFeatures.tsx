'use client'

import { useAuth } from './AuthProvider'
import { Shield, Users, BarChart3, Settings, Crown, Briefcase, User, Eye } from 'lucide-react'

interface FeatureCard {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  available: boolean
}

export default function RoleBasedFeatures() {
  const { user } = useAuth()

  if (!user) return null

  const getFeaturesByRole = (role: string): FeatureCard[] => {
    const baseFeatures: FeatureCard[] = [
      {
        title: 'View Messages',
        description: 'Access customer messages and conversations',
        icon: <Eye className="w-5 h-5" />,
        color: 'bg-blue-500',
        available: true
      },
      {
        title: 'Reply to Messages',
        description: 'Respond to customer inquiries',
        icon: <User className="w-5 h-5" />,
        color: 'bg-green-500',
        available: true
      }
    ]

    const adminFeatures: FeatureCard[] = [
      ...baseFeatures,
      {
        title: 'User Management',
        description: 'Manage staff accounts and permissions',
        icon: <Users className="w-5 h-5" />,
        color: 'bg-purple-500',
        available: ['admin', 'manager', 'direktur'].includes(role)
      },
      {
        title: 'Analytics Dashboard',
        description: 'View detailed performance metrics',
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'bg-indigo-500',
        available: ['admin', 'manager', 'direktur'].includes(role)
      }
    ]

    const managerFeatures: FeatureCard[] = [
      ...adminFeatures,
      {
        title: 'Department Management',
        description: 'Oversee team performance and workflows',
        icon: <Briefcase className="w-5 h-5" />,
        color: 'bg-orange-500',
        available: ['manager', 'direktur'].includes(role)
      },
      {
        title: 'Advanced Reports',
        description: 'Generate comprehensive business reports',
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'bg-teal-500',
        available: ['manager', 'direktur'].includes(role)
      }
    ]

    const direkturFeatures: FeatureCard[] = [
      ...managerFeatures,
      {
        title: 'System Configuration',
        description: 'Configure system-wide settings and policies',
        icon: <Settings className="w-5 h-5" />,
        color: 'bg-red-500',
        available: role === 'direktur'
      },
      {
        title: 'Executive Dashboard',
        description: 'High-level business intelligence and insights',
        icon: <Crown className="w-5 h-5" />,
        color: 'bg-amber-500',
        available: role === 'direktur'
      }
    ]

    switch (role) {
      case 'staff': return baseFeatures
      case 'admin': return adminFeatures
      case 'manager': return managerFeatures
      case 'direktur': return direkturFeatures
      default: return baseFeatures
    }
  }

  const features = getFeaturesByRole(user.role)
  const availableFeatures = features.filter(f => f.available)
  const unavailableFeatures = features.filter(f => !f.available)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your Access Level</h2>
          <p className="text-sm text-gray-600">Features available for {user.role} role</p>
        </div>
      </div>

      {/* Available Features */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableFeatures.map((feature, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className={`p-2 ${feature.color} rounded-lg text-white flex-shrink-0`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unavailable Features */}
      {unavailableFeatures.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Requires Higher Access Level</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unavailableFeatures.map((feature, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg opacity-50 bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-400 rounded-lg text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-600 text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                    <p className="text-xs text-red-500 mt-1">Access Denied</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
