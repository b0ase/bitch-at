'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isAdmin = (session?.user as any)?.isAdmin

  return (
    <>
      {/* Admin Bar - Only show for admin users */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-red-900 to-red-800 border-b border-red-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center space-x-4">
                <span className="text-red-200 text-sm font-medium">🔒 Admin Panel</span>
                <Link
                  href="/admin"
                  className="text-red-200 hover:text-white text-sm transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-red-200 hover:text-white text-sm transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/posts"
                  className="text-red-200 hover:text-white text-sm transition-colors"
                >
                  Content
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-red-200 hover:text-white text-sm transition-colors"
                >
                  Analytics
                </Link>
              </div>
              <div className="text-red-300 text-xs">
                Welcome, Admin • Google Workspace Connected
              </div>
            </div>
          </div>
        </div>
      )}

      <header className={`bg-black border-b border-gray-800 sticky ${isAdmin ? 'top-10' : 'top-0'} z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white">
            Bitch@
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/exchange" className="text-gray-300 hover:text-white transition-colors">
              Exchange
            </Link>
            <Link href="/wallet" className="text-gray-300 hover:text-white transition-colors">
              Wallet
            </Link>
            <Link href="/subscribe" className="text-gray-300 hover:text-white transition-colors">
              Subscribe
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                {/* User Avatar */}
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                )}

                {/* User Name */}
                <span className="text-gray-300 hidden sm:block">
                  {session.user?.name || 'User'}
                </span>

                {/* Sign Out Button */}
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Regular User Sign In */}
                <button
                  onClick={() => signIn('twitter')}
                  className="bg-twitter-blue hover:bg-twitter-dark-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span className="text-lg">🐦</span>
                  <span>Sign In</span>
                </button>

                {/* Admin Sign In */}
                <button
                  onClick={() => signIn('google')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-sm"
                >
                  <span className="text-lg">🔒</span>
                  <span>Admin</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/exchange" className="text-gray-300 hover:text-white transition-colors">
                Exchange
              </Link>
              <Link href="/wallet" className="text-gray-300 hover:text-white transition-colors">
                Wallet
              </Link>
              <Link href="/subscribe" className="text-gray-300 hover:text-white transition-colors">
                Subscribe
              </Link>

              {/* Mobile Sign In Options */}
              {!session && (
                <div className="border-t border-gray-700 pt-4 mt-4 space-y-3">
                  <button
                    onClick={() => signIn('twitter')}
                    className="w-full bg-twitter-blue hover:bg-twitter-dark-hover text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🐦</span>
                    <span>Sign In with Twitter</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  )
}
