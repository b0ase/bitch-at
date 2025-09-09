'use client'

import { useState, useEffect, useRef } from 'react'

export default function MiningBar() {
  const [txCount, setTxCount] = useState(0)
  const [blockHeight, setBlockHeight] = useState(874231)
  const [hashRate, setHashRate] = useState(712.4)
  const [difficulty, setDifficulty] = useState('101.6T')
  const [mempool, setMempool] = useState(42)
  const [isExploding, setIsExploding] = useState(false)
  const txRef = useRef(0)
  const animationRef = useRef<number>()

  useEffect(() => {
    // Start the animation immediately
    const animate = () => {
      // Increase TX count rapidly
      if (txRef.current < 2500) {
        // Accelerating growth
        const increment = Math.floor(10 + (txRef.current / 100))
        txRef.current += increment
        setTxCount(txRef.current)
      } else if (txRef.current >= 2500 && txRef.current < 2510) {
        // Hit 2500 - pause briefly
        txRef.current = 2510
        setTxCount(2500)
        setTimeout(() => {
          setIsExploding(true)
        }, 1000)
      } else if (txRef.current >= 2510 && txRef.current < 100000) {
        // EXPLOSION PHASE
        const explosiveIncrement = Math.floor(Math.random() * 1000) + 500
        txRef.current += explosiveIncrement
        setTxCount(txRef.current)
      } else {
        // Reset
        txRef.current = 0
        setTxCount(0)
        setIsExploding(false)
        setBlockHeight(prev => prev + 1)
      }
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate)
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Hash rate animation
  useEffect(() => {
    const interval = setInterval(() => {
      setHashRate(prev => {
        const change = isExploding ? (Math.random() * 50) : (Math.random() - 0.5) * 5
        return Math.max(100, +(prev + change).toFixed(1))
      })
      
      setMempool(prev => {
        if (isExploding) {
          return Math.floor(Math.random() * 200) + 100
        }
        return Math.max(20, prev + Math.floor(Math.random() * 20) - 10)
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isExploding])

  return (
    <div className={`bg-gradient-to-r from-orange-900 via-orange-800 to-yellow-900 border-b border-orange-700 sticky top-0 z-50 transition-all duration-300 ${isExploding ? 'animate-pulse bg-gradient-to-r from-yellow-900 via-orange-600 to-red-900' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-orange-300">⛏️ Mining</span>
              <span className="text-orange-100 font-mono">Block #{blockHeight.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-orange-300">TX:</span>
              <span 
                className={`font-mono transition-all duration-300 ${
                  isExploding 
                    ? 'text-yellow-300 text-xl font-bold animate-bounce' 
                    : 'text-orange-100'
                }`}
              >
                {txCount.toLocaleString()}
              </span>
              {isExploding && (
                <>
                  <span className="text-yellow-300 animate-ping">🚀</span>
                  <span className="text-white font-bold animate-pulse">MOON!</span>
                </>
              )}
            </div>

            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-orange-300">Mempool:</span>
              <span className={`text-orange-100 font-mono ${isExploding ? 'text-yellow-300 animate-pulse' : ''}`}>
                {mempool} MB
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <span className="text-orange-300">Hash Rate:</span>
              <span className={`text-orange-100 font-mono ${isExploding ? 'text-yellow-300 animate-pulse' : ''}`}>
                {hashRate} EH/s
              </span>
            </div>

            <div className="hidden lg:flex items-center space-x-2">
              <span className="text-orange-300">Difficulty:</span>
              <span className="text-orange-100 font-mono">{difficulty}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isExploding ? 'bg-yellow-400 animate-ping' : 'bg-green-400 animate-pulse'}`}></div>
            <span className={`text-xs ${isExploding ? 'text-yellow-300 font-bold' : 'text-orange-200'}`}>
              {isExploding ? 'BSV EXPLODING!' : 'BSV Network'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}