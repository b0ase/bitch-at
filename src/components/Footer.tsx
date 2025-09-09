import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Bitch@</h3>
            <p className="text-gray-400 text-sm">
              The decentralized social platform where every post is an investment.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/exchange" className="text-gray-400 hover:text-white transition-colors">
                  Token Exchange
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="text-gray-400 hover:text-white transition-colors">
                  Wallet
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Premium
                </Link>
              </li>
              <li>
                <Link href="/build" className="text-gray-400 hover:text-white transition-colors">
                  BSV Build
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                  Admin Panel
                </Link>
              </li>
              <li>
                <a href="https://github.com/b0ase/bitch-at" className="text-gray-400 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-400 hover:text-white transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="space-y-3">
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
                Join Discord
              </button>
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
                Follow on X
              </button>
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 Bitch@. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}