'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Settings, Instagram, MessageCircle, Eye, EyeOff, Save, RefreshCw, AlertTriangle, CheckCircle, Key, Shield } from 'lucide-react'

interface ConfigData {
  instagram: {
    accessToken: string
    appId: string
    appSecret: string
    pageId: string
    webhookVerifyToken: string
  }
  whatsapp: {
    accessToken: string
    phoneNumberId: string
    businessAccountId: string
    webhookVerifyToken: string
    appId: string
    appSecret: string
  }
}

export default function ConfigPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [config, setConfig] = useState<ConfigData>({
    instagram: {
      accessToken: '',
      appId: '',
      appSecret: '',
      pageId: '',
      webhookVerifyToken: ''
    },
    whatsapp: {
      accessToken: '',
      phoneNumberId: '',
      businessAccountId: '',
      webhookVerifyToken: '',
      appId: '',
      appSecret: ''
    }
  })
  
  const [showSecrets, setShowSecrets] = useState({
    instagramToken: false,
    instagramSecret: false,
    whatsappToken: false,
    whatsappSecret: false,
    webhookTokens: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    // Only allow admin, manager, and direktur to access config
    if (!['admin', 'manager', 'direktur'].includes(user.role)) {
      router.push('/')
      return
    }
    
    loadConfig()
  }, [user, router])

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })
      
      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (platform: 'instagram' | 'whatsapp', field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }))
  }

  const toggleSecretVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (!user || !['admin', 'manager', 'direktur'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">API Configuration</h1>
                  <p className="text-sm text-gray-600">Manage Instagram & WhatsApp credentials</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {saveStatus === 'success' && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved successfully</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Save failed</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Security Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Security Notice</h3>
                <p className="text-sm text-amber-700 mt-1">
                  These credentials are sensitive. Only authorized personnel should modify these settings. 
                  Changes will affect all platform integrations immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Instagram Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Instagram Configuration</h2>
                <p className="text-sm text-gray-600">Manage Instagram Graph API credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.instagramToken ? 'text' : 'password'}
                    value={config.instagram.accessToken}
                    onChange={(e) => handleInputChange('instagram', 'accessToken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Enter Instagram access token"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('instagramToken')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.instagramToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App ID
                </label>
                <input
                  type="text"
                  value={config.instagram.appId}
                  onChange={(e) => handleInputChange('instagram', 'appId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Instagram App ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.instagramSecret ? 'text' : 'password'}
                    value={config.instagram.appSecret}
                    onChange={(e) => handleInputChange('instagram', 'appSecret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Enter Instagram App Secret"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('instagramSecret')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.instagramSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page ID
                </label>
                <input
                  type="text"
                  value={config.instagram.pageId}
                  onChange={(e) => handleInputChange('instagram', 'pageId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Instagram Page ID"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Verify Token
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.webhookTokens ? 'text' : 'password'}
                    value={config.instagram.webhookVerifyToken}
                    onChange={(e) => handleInputChange('instagram', 'webhookVerifyToken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Enter webhook verify token"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('webhookTokens')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.webhookTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">WhatsApp Configuration</h2>
                <p className="text-sm text-gray-600">Manage WhatsApp Business API credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.whatsappToken ? 'text' : 'password'}
                    value={config.whatsapp.accessToken}
                    onChange={(e) => handleInputChange('whatsapp', 'accessToken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Enter WhatsApp access token"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('whatsappToken')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.whatsappToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={config.whatsapp.phoneNumberId}
                  onChange={(e) => handleInputChange('whatsapp', 'phoneNumberId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Phone Number ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Account ID
                </label>
                <input
                  type="text"
                  value={config.whatsapp.businessAccountId}
                  onChange={(e) => handleInputChange('whatsapp', 'businessAccountId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Business Account ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App ID
                </label>
                <input
                  type="text"
                  value={config.whatsapp.appId}
                  onChange={(e) => handleInputChange('whatsapp', 'appId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter WhatsApp App ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.whatsappSecret ? 'text' : 'password'}
                    value={config.whatsapp.appSecret}
                    onChange={(e) => handleInputChange('whatsapp', 'appSecret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Enter WhatsApp App Secret"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('whatsappSecret')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.whatsappSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Verify Token
                </label>
                <input
                  type="text"
                  value={config.whatsapp.webhookVerifyToken}
                  onChange={(e) => handleInputChange('whatsapp', 'webhookVerifyToken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter webhook verify token"
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-2">Configuration Instructions</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p><strong>Instagram:</strong> Get credentials from Facebook Developers Console → Your App → Instagram Basic Display</p>
                  <p><strong>WhatsApp:</strong> Get credentials from Facebook Developers Console → Your App → WhatsApp Business API</p>
                  <p><strong>Webhook URL:</strong> https://utserang.info/api/webhook</p>
                  <p><strong>Note:</strong> Changes take effect immediately. Test connections after saving.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
