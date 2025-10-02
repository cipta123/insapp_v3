'use client'

import { useAuth } from './AuthProvider'
import { Sparkles, Target, TrendingUp, Crown } from 'lucide-react'

export default function WelcomeMessage() {
  const { user } = useAuth()

  if (!user) return null

  const getWelcomeContent = (role: string, name: string) => {
    const timeOfDay = new Date().getHours()
    const greeting = timeOfDay < 12 ? 'Good Morning' : timeOfDay < 18 ? 'Good Afternoon' : 'Good Evening'

    const roleMessages = {
      staff: {
        title: `${greeting}, ${name}! 👋`,
        subtitle: 'Ready to help customers today?',
        message: 'You have access to customer messages and can reply to inquiries. Check your assigned conversations and provide excellent customer service!',
        icon: <Sparkles className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600',
        tips: [
          'Check unread messages first',
          'Use quick replies for common questions',
          'Always be polite and helpful'
        ]
      },
      admin: {
        title: `${greeting}, Admin ${name}! 🛡️`,
        subtitle: 'System oversight and management',
        message: 'Monitor system performance, manage users, and ensure smooth operations. You have elevated access to analytics and user management features.',
        icon: <Target className="w-6 h-6" />,
        color: 'from-green-500 to-green-600',
        tips: [
          'Monitor system health regularly',
          'Review user activity logs',
          'Manage staff permissions'
        ]
      },
      manager: {
        title: `${greeting}, Manager ${name}! 💼`,
        subtitle: 'Department leadership and strategy',
        message: 'Oversee team performance, generate reports, and drive departmental goals. Your leadership ensures excellent customer service delivery.',
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'from-purple-500 to-purple-600',
        tips: [
          'Review team performance metrics',
          'Generate weekly reports',
          'Plan resource allocation'
        ]
      },
      direktur: {
        title: `${greeting}, Direktur ${name}! 👑`,
        subtitle: 'Executive leadership and vision',
        message: 'Strategic oversight of the entire customer service operation. Access to executive dashboards, system configuration, and high-level business intelligence.',
        icon: <Crown className="w-6 h-6" />,
        color: 'from-amber-500 to-amber-600',
        tips: [
          'Review executive dashboard',
          'Monitor business KPIs',
          'Strategic decision making'
        ]
      }
    }

    return roleMessages[role as keyof typeof roleMessages] || roleMessages.staff
  }

  const content = getWelcomeContent(user.role, user.name)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className={`p-3 bg-gradient-to-r ${content.color} rounded-lg text-white flex-shrink-0`}>
          {content.icon}
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{content.title}</h2>
          <p className="text-sm text-gray-600 mb-3">{content.subtitle}</p>
          <p className="text-gray-700 mb-4">{content.message}</p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Today's Focus:</h3>
            <ul className="space-y-1">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
