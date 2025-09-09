'use client'

import TweetComposer from '@/components/TweetComposer'
import Timeline from '@/components/Timeline'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-1/4 xl:w-1/5 pr-8">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:w-3/4 xl:w-4/5 max-w-2xl mx-auto">
            {/* Tweet Composer */}
            <div className="border-b border-gray-800 pb-4 mb-4">
              <TweetComposer />
            </div>

            {/* Timeline */}
            <Timeline />
          </div>

          {/* Right Sidebar - Could be trending topics, etc. */}
          <div className="hidden xl:block xl:w-1/5 pl-8">
            <div className="sticky top-24">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4">Trending on Bitch@</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium">#BitcoinSV</div>
                    <div className="text-gray-400">42.1K posts</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">#JackDorsey</div>
                    <div className="text-gray-400">18.7K posts</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">#RealBitcoin</div>
                    <div className="text-gray-400">12.3K posts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
