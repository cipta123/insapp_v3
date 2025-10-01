import jwt from 'jsonwebtoken'

export interface AuthUser {
  userId: string
  username: string
  role: 'staff' | 'admin' | 'manager' | 'direktur'
  name: string
}

export const roleHierarchy = {
  staff: 1,
  admin: 2,
  manager: 3,
  direktur: 4
}

export const rolePermissions = {
  staff: [
    'view_messages',
    'reply_messages',
    'view_own_stats'
  ],
  admin: [
    'view_messages',
    'reply_messages',
    'view_own_stats',
    'view_all_stats',
    'manage_users',
    'view_analytics'
  ],
  manager: [
    'view_messages',
    'reply_messages',
    'view_own_stats',
    'view_all_stats',
    'manage_users',
    'view_analytics',
    'manage_departments',
    'view_reports'
  ],
  direktur: [
    'view_messages',
    'reply_messages',
    'view_own_stats',
    'view_all_stats',
    'manage_users',
    'view_analytics',
    'manage_departments',
    'view_reports',
    'manage_system',
    'view_executive_dashboard'
  ]
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      name: decoded.name
    }
  } catch (error) {
    return null
  }
}

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = rolePermissions[userRole as keyof typeof rolePermissions]
  return permissions?.includes(permission) || false
}

export function hasMinimumRole(userRole: string, minimumRole: string): boolean {
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[minimumRole as keyof typeof roleHierarchy] || 0
  return userLevel >= requiredLevel
}

export function getRoleColor(role: string): string {
  const colors = {
    staff: 'blue',
    admin: 'green',
    manager: 'purple',
    direktur: 'amber'
  }
  return colors[role as keyof typeof colors] || 'gray'
}

export function getRoleIcon(role: string): string {
  const icons = {
    staff: 'User',
    admin: 'Shield',
    manager: 'Briefcase',
    direktur: 'Crown'
  }
  return icons[role as keyof typeof icons] || 'User'
}
