'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

const Sidebar = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user) {
      checkAdminStatus()
    }
  }, [session])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/status')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      }
    } catch (error) {
      console.error('Failed to check admin status:', error)
    }
  }

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: '🏠',
      active: pathname === '/',
    },
    {
      name: 'Explore',
      href: '/explore',
      icon: '🔍',
      active: pathname === '/explore',
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: '🔔',
      active: pathname === '/notifications',
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: '✉️',
      active: pathname === '/messages',
    },
    {
      name: 'Bookmarks',
      href: '/bookmarks',
      icon: '🔖',
      active: pathname === '/bookmarks',
    },
    {
      name: 'Profile',
      href: session?.user ? `/profile/${session.user.username}` : '/profile',
      icon: '👤',
      active: pathname?.startsWith('/profile'),
    },
    {
      name: 'Exchange',
      href: '/exchange',
      icon: '📈',
      active: pathname === '/exchange',
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: '💰',
      active: pathname === '/wallet',
    },
  ]

  return (
    <div className={`sticky ${isAdmin ? 'top-20' : 'top-16'}`}>
      <nav className="space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-full transition-colors ${
              item.active
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}

        {/* Post Button */}
        <button className="w-full bg-twitter-blue hover:bg-twitter-dark-hover text-white font-bold py-3 px-4 rounded-full transition-colors mt-4">
          Post
        </button>
      </nav>

      {/* User Card */}
      {session?.user && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <div className="flex items-center space-x-3">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">
                  {session.user.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">
                {session.user.name}
              </div>
              <div className="text-gray-400 text-sm truncate">
                @{session.user.name?.toLowerCase().replace(/\s+/g, '')}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Sidebar
