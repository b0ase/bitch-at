'use client'

import { useState, useEffect } from 'react'

export default function MiningBar() {
  const [txCount, setTxCount] = useState(2847)
  const [blockHeight, setBlockHeight] = useState(874231)
  const [hashRate, setHashRate] = useState(712.4)
  const [difficulty, setDifficulty] = useState('101.6T')
  const [mempool, setMempool] = useState(42)

  useEffect(() => {
    // Increment TX count
    const txInterval = setInterval(() => {
      setTxCount(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 2000)

    // Occasionally increment block height
    const blockInterval = setInterval(() => {
      setBlockHeight(prev => prev + 1)
      setTxCount(0) // Reset TX count on new block
      setMempool(prev => Math.max(20, prev + Math.floor(Math.random() * 20) - 10))
    }, 30000)

    // Update hash rate
    const hashInterval = setInterval(() => {
      setHashRate(prev => +(prev + (Math.random() - 0.5) * 5).toFixed(1))
    }, 5000)

    return () => {
      clearInterval(txInterval)
      clearInterval(blockInterval)
      clearInterval(hashInterval)
    }
  }, [])

  return (
    <div className="bg-gradient-to-r from-orange-900 via-orange-800 to-yellow-900 border-b border-orange-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-orange-300">⛏️ Mining</span>
              <span className="text-orange-100 font-mono">Block #{blockHeight.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-orange-300">TX:</span>
              <span className="text-orange-100 font-mono animate-pulse">{txCount.toLocaleString()}</span>
            </div>

            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-orange-300">Mempool:</span>
              <span className="text-orange-100 font-mono">{mempool} MB</span>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <span className="text-orange-300">Hash Rate:</span>
              <span className="text-orange-100 font-mono">{hashRate} EH/s</span>
            </div>

            <div className="hidden lg:flex items-center space-x-2">
              <span className="text-orange-300">Difficulty:</span>
              <span className="text-orange-100 font-mono">{difficulty}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-orange-200 text-xs">BSV Network</span>
          </div>
        </div>
      </div>
    </div>
  )
}