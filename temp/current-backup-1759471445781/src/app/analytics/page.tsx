'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts'
import { 
  MessageCircle, Clock, CheckCircle, TrendingUp, Users, 
  Calendar, Target, Activity, Award, AlertCircle, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  keyMetrics: {
    totalMessages: number
    totalMessagesChange: number
    answeredMessages: number
    unansweredMessages: number
    avgResponseTime: string
    avgResponseTimeMinutes: number
  }
  channelBreakdown: {
    whatsapp: number
    instagramDM: number
    instagramComments: number
  }
  performance: {
    slaMetrics: {
      under5min: number
      under15min: number
      over1hour: number
    }
    agentStats: Array<{
      name: string
      repliesCount: number
      avgResponseTime: number
    }>
  }
  trends: {
    hourlyData: Array<{
      hour: string
      messages: number
    }>
    dailyData: Array<{
      day: string
      messages: number
    }>
    weeklyTrend: Array<{
      week: string
      whatsapp: number
      instagramDM: number
      instagramComments: number
    }>
  }
  operationalStatus: {
    completedChats: number
    pendingChats: number
    avgConversationLength: number
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // 1d, 7d, 30d

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load analytics data</p>
          </div>
        </div>
      </div>
    )
  }

  const channelData = [
    { name: 'WhatsApp', value: analyticsData.channelBreakdown.whatsapp, color: '#25D366' },
    { name: 'Instagram DM', value: analyticsData.channelBreakdown.instagramDM, color: '#E4405F' },
    { name: 'Instagram Comments', value: analyticsData.channelBreakdown.instagramComments, color: '#833AB4' }
  ]

  const slaData = [
    { name: '< 5 min', value: analyticsData.performance.slaMetrics.under5min, color: '#10B981' },
    { name: '< 15 min', value: analyticsData.performance.slaMetrics.under15min, color: '#F59E0B' },
    { name: '> 1 hour', value: analyticsData.performance.slaMetrics.over1hour, color: '#EF4444' }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-3xl font-bold text-gray-900">📊 Customer Service Analytics</h1>
                <p className="text-gray-600 mt-2">Comprehensive insights into your customer service performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* 1. Key Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Messages */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.keyMetrics.totalMessages}</p>
                  <p className={`text-sm mt-1 ${
                    analyticsData.keyMetrics.totalMessagesChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analyticsData.keyMetrics.totalMessagesChange >= 0 ? '+' : ''}{analyticsData.keyMetrics.totalMessagesChange}% vs previous period
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Response Rate */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {Math.round((analyticsData.keyMetrics.answeredMessages / analyticsData.keyMetrics.totalMessages) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analyticsData.keyMetrics.answeredMessages} answered, {analyticsData.keyMetrics.unansweredMessages} pending
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Average Response Time */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.keyMetrics.avgResponseTime}</p>
                  <p className="text-sm text-green-600 mt-1">-12% improvement</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Active Channels */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Channels</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
                  <p className="text-sm text-gray-500 mt-1">WhatsApp, IG DM, IG Comments</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Channel Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Channel Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📱 Channel Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Weekly Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.trends.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} />
                  <Line type="monotone" dataKey="instagramDM" stroke="#E4405F" strokeWidth={2} />
                  <Line type="monotone" dataKey="instagramComments" stroke="#833AB4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* SLA Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-6">⏱️ SLA Performance</h3>
            <div className="space-y-4">
              {slaData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {slaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-6">👥 Agent Performance</h3>
            <div className="space-y-4">
              {analyticsData.performance.agentStats.map((agent, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{agent.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">{agent.repliesCount} replies</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{agent.avgResponseTime}min</p>
                    <p className="text-xs text-gray-500">avg response</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Time Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hourly Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🕐 Hourly Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.trends.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="messages" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📅 Daily Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.trends.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. Operational Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🎯 Operational Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.operationalStatus.completedChats}</p>
              <p className="text-sm text-gray-600">Completed Chats</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.operationalStatus.pendingChats}</p>
              <p className="text-sm text-gray-600">Pending Chats</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.operationalStatus.avgConversationLength}</p>
              <p className="text-sm text-gray-600">Avg Messages per Chat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
