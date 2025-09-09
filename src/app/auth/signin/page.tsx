'use client'

import { getProviders, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

type Provider = {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)

  useEffect(() => {
    const getProvidersData = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    getProvidersData()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Bitch@</h1>
          <p className="text-gray-400">Real Bitcoin Social Platform</p>
        </div>

        {/* Sign In Options */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Choose Your Sign In Method</h2>
            <p className="text-gray-400 text-sm">
              Connect any wallet or use social login - we accept all payments!
            </p>
          </div>

          {/* Wallet Sign In */}
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-6 border border-purple-600">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">👛</div>
              <h3 className="text-xl font-bold">Any Wallet</h3>
              <p className="text-gray-300 text-sm mt-1">
                Connect your favorite wallet - we accept any currency
              </p>
            </div>

            <button
              onClick={() => signIn('credentials', { callbackUrl: '/' })}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>👛</span>
              <span>Connect Wallet</span>
            </button>

            <div className="mt-4 text-xs text-purple-300 text-center">
              Pay with any crypto, manage tokens on our platform
            </div>
          </div>

          {/* Twitter Sign In */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🐦</div>
              <h3 className="text-xl font-bold">Twitter User</h3>
              <p className="text-gray-400 text-sm mt-1">
                Quick sign-in with Twitter for social features
              </p>
            </div>

            <button
              onClick={() => signIn('twitter', { callbackUrl: '/' })}
              className="w-full bg-twitter-blue hover:bg-twitter-dark-hover text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🐦</span>
              <span>Continue with Twitter</span>
            </button>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Access posting, NFT minting, exchange, and all social features
            </div>
          </div>

          {/* Admin Sign In */}
          <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-lg p-6 border border-red-600">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-xl font-bold">Administrator</h3>
              <p className="text-gray-300 text-sm mt-1">
                Developer access with full Google Workspace integration
              </p>
            </div>

            <button
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
              className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔒</span>
              <span>Continue with Google</span>
            </button>

            <div className="mt-4 text-xs text-red-300 text-center">
              Admin access to Gmail, Drive, Docs, Sheets, YouTube, Analytics & Gemini AI
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <a
              href="/"
              className="text-twitter-blue hover:text-twitter-dark-hover transition-colors text-sm"
            >
              ← Back to Bitch@
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>Built on Bitcoin SV - The Real Bitcoin 🚀</p>
          <p className="mt-1">Trolling Jack Dorsey's BitChat since 2024</p>
        </div>
      </div>
    </div>
  )
}
