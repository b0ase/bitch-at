'use client'

import { useState, useEffect } from 'react'

export default function MiningBar() {
  const [txCount, setTxCount] = useState(0)
  const [blockHeight, setBlockHeight] = useState(874231)
  const [hashRate, setHashRate] = useState(712.4)
  const [difficulty, setDifficulty] = useState('101.6T')
  const [mempool, setMempool] = useState(42)
  const [isExploding, setIsExploding] = useState(false)

  useEffect(() => {
    let currentTx = 0
    
    // FAST growth to 2500
    const fastGrowthInterval = setInterval(() => {
      if (currentTx < 2500) {
        // Accelerating growth - starts slow, gets faster
        const growthRate = Math.floor(Math.random() * 50) + Math.floor(currentTx / 50) + 10
        currentTx = Math.min(2500, currentTx + growthRate)
        setTxCount(currentTx)
      } else if (currentTx === 2500) {
        // Pause at 2500 for dramatic effect
        setTimeout(() => {
          setIsExploding(true)
          // Continue growing explosively
          const explosiveGrowth = setInterval(() => {
            currentTx += Math.floor(Math.random() * 500) + 200
            setTxCount(currentTx)
            
            // Stop at a huge number
            if (currentTx > 50000) {
              clearInterval(explosiveGrowth)
              // Reset after showing the huge number
              setTimeout(() => {
                currentTx = 0
                setTxCount(0)
                setIsExploding(false)
                setBlockHeight(prev => prev + 1)
              }, 3000)
            }
          }, 100)
        }, 2000) // Pause for 2 seconds at 2500
        clearInterval(fastGrowthInterval)
      }
    }, 100) // Update every 100ms for smooth fast growth

    // Update hash rate with more variation
    const hashInterval = setInterval(() => {
      setHashRate(prev => {
        const change = isExploding ? (Math.random() * 50) : (Math.random() - 0.5) * 5
        return +(prev + change).toFixed(1)
      })
    }, 2000)

    // Update mempool
    const mempoolInterval = setInterval(() => {
      setMempool(prev => {
        if (isExploding) {
          return Math.floor(Math.random() * 200) + 100
        }
        return Math.max(20, prev + Math.floor(Math.random() * 20) - 10)
      })
    }, 3000)

    return () => {
      clearInterval(fastGrowthInterval)
      clearInterval(hashInterval)
      clearInterval(mempoolInterval)
    }
  }, [blockHeight]) // Restart animation when block changes

  return (
    <div className={`bg-gradient-to-r from-orange-900 via-orange-800 to-yellow-900 border-b border-orange-700 sticky top-0 z-50 ${isExploding ? 'animate-pulse' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-orange-300">⛏️ Mining</span>
              <span className="text-orange-100 font-mono">Block #{blockHeight.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-orange-300">TX:</span>
              <span className={`font-mono ${isExploding ? 'text-yellow-300 text-lg font-bold animate-bounce' : 'text-orange-100 animate-pulse'}`}>
                {txCount.toLocaleString()}
              </span>
              {isExploding && <span className="text-yellow-300 animate-ping">🚀</span>}
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