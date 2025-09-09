'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GoogleService {
  name: string
  icon: string
  description: string
  status: 'connected' | 'disconnected' | 'loading'
  endpoint: string
  color: string
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const [services, setServices] = useState<GoogleService[]>([
    {
      name: 'Gmail',
      icon: '📧',
      description: 'Email management and automation',
      status: 'disconnected',
      endpoint: '/api/admin/gmail',
      color: 'bg-red-500'
    },
    {
      name: 'Google Docs',
      icon: '📄',
      description: 'Document creation and management',
      status: 'disconnected',
      endpoint: '/api/admin/docs',
      color: 'bg-blue-500'
    },
    {
      name: 'Google Sheets',
      icon: '📊',
      description: 'Spreadsheet data and analytics',
      status: 'disconnected',
      endpoint: '/api/admin/sheets',
      color: 'bg-green-500'
    },
    {
      name: 'Google Drive',
      icon: '☁️',
      description: 'File storage and management',
      status: 'disconnected',
      endpoint: '/api/admin/drive',
      color: 'bg-yellow-500'
    },
    {
      name: 'YouTube',
      icon: '🎥',
      description: 'Video content management',
      status: 'disconnected',
      endpoint: '/api/admin/youtube',
      color: 'bg-red-600'
    },
    {
      name: 'Google Analytics',
      icon: '📈',
      description: 'Website and user analytics',
      status: 'disconnected',
      endpoint: '/api/admin/analytics',
      color: 'bg-purple-500'
    },
    {
      name: 'Gemini AI',
      icon: '🤖',
      description: 'AI-powered content generation',
      status: 'disconnected',
      endpoint: '/api/admin/gemini',
      color: 'bg-indigo-500'
    }
  ])

  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [session])

  const checkAdminStatus = async () => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/status')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      }
    } catch (error) {
      console.error('Failed to check admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const testServiceConnection = async (service: GoogleService) => {
    setServices(prev => prev.map(s =>
      s.name === service.name
        ? { ...s, status: 'loading' as const }
        : s
    ))

    try {
      const response = await fetch(service.endpoint)
      if (response.ok) {
        setServices(prev => prev.map(s =>
          s.name === service.name
            ? { ...s, status: 'connected' as const }
            : s
        ))
      } else {
        setServices(prev => prev.map(s =>
          s.name === service.name
            ? { ...s, status: 'disconnected' as const }
            : s
        ))
      }
    } catch (error) {
      console.error(`Failed to test ${service.name}:`, error)
      setServices(prev => prev.map(s =>
        s.name === service.name
          ? { ...s, status: 'disconnected' as const }
          : s
      ))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Please sign in with Google to access the admin panel.</p>
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-400 mb-6">You need admin privileges to access this panel.</p>
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔒 Admin Panel</h1>
          <p className="text-gray-400">
            Manage your Google Workspace integrations and Bitch@ platform
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Signed in as: {session.user.email}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-2xl font-bold text-red-500">
              {services.filter(s => s.status === 'connected').length}
            </div>
            <div className="text-gray-400">Connected Services</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-2xl font-bold text-blue-500">1,247</div>
            <div className="text-gray-400">Total Posts</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-2xl font-bold text-green-500">856</div>
            <div className="text-gray-400">Premium Users</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-2xl font-bold text-purple-500">2.4K</div>
            <div className="text-gray-400">NFT Tokens</div>
          </div>
        </div>

        {/* Google Services Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Google Workspace Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        service.status === 'connected'
                          ? 'bg-green-900 text-green-400'
                          : service.status === 'loading'
                          ? 'bg-yellow-900 text-yellow-400'
                          : 'bg-red-900 text-red-400'
                      }`}>
                        {service.status === 'connected' ? 'Connected' :
                         service.status === 'loading' ? 'Testing...' : 'Disconnected'}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">{service.description}</p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => testServiceConnection(service)}
                    disabled={service.status === 'loading'}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {service.status === 'loading' ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Platform Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">👥 User Management</h3>
              <p className="text-gray-400 text-sm mb-4">Manage users, ban accounts, view analytics</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                Manage Users
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">💰 Subscription Management</h3>
              <p className="text-gray-400 text-sm mb-4">Handle payments, refunds, billing</p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                Manage Billing
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">🎨 NFT Management</h3>
              <p className="text-gray-400 text-sm mb-4">Monitor NFT minting, token trading</p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                Manage NFTs
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">📊 Content Moderation</h3>
              <p className="text-gray-400 text-sm mb-4">Review posts, manage content policies</p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors">
                Moderate Content
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">🔧 System Settings</h3>
              <p className="text-gray-400 text-sm mb-4">Configure platform settings, APIs</p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
                System Config
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">📈 Analytics Dashboard</h3>
              <p className="text-gray-400 text-sm mb-4">View platform metrics and insights</p>
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">API Configuration Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-800 rounded">
              <div>
                <div className="font-medium">Google OAuth 2.0</div>
                <div className="text-sm text-gray-400">Authentication and API access</div>
              </div>
              <div className="text-green-400 font-medium">✓ Configured</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-800 rounded">
              <div>
                <div className="font-medium">Gmail API</div>
                <div className="text-sm text-gray-400">Email reading and automation</div>
              </div>
              <div className="text-yellow-400 font-medium">⚠️ Needs API Key</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-800 rounded">
              <div>
                <div className="font-medium">Google Drive API</div>
                <div className="text-sm text-gray-400">File storage and management</div>
              </div>
              <div className="text-yellow-400 font-medium">⚠️ Needs API Key</div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-800 rounded">
              <div>
                <div className="font-medium">YouTube Data API</div>
                <div className="text-sm text-gray-400">Video content management</div>
              </div>
              <div className="text-yellow-400 font-medium">⚠️ Needs API Key</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900 rounded-lg">
            <h3 className="font-bold mb-2">🔧 Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-200">
              <li>Go to <a href="https://console.cloud.google.com" className="underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Create or select a project</li>
              <li>Enable the required APIs (Gmail, Drive, Docs, Sheets, YouTube, Analytics)</li>
              <li>Create OAuth 2.0 credentials</li>
              <li>Add your domain to authorized origins</li>
              <li>Update environment variables with your API keys</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
