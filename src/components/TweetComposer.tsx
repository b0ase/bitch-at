'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const TweetComposer = () => {
  const { data: session } = useSession()
  const [tweetText, setTweetText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [userIsPremium, setUserIsPremium] = useState(false)
  const [mintAsNFT, setMintAsNFT] = useState(true)
  const [postingCost] = useState(0.001) // BSV cost for posting
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (session?.user) {
      checkPremiumStatus()
    }
  }, [session])

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/user/premium-status')
      if (response.ok) {
        const data = await response.json()
        setUserIsPremium(data.isPremium)
      }
    } catch (error) {
      console.error('Failed to check premium status:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !tweetText.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: tweetText,
          isPremium: userIsPremium,
          mintAsNFT: mintAsNFT && userIsPremium,
        }),
      })

      if (response.ok) {
        setTweetText('')
        setIsFocused(false)
        // Refresh the timeline
        window.location.reload()
      } else {
        alert('Failed to post. Please try again.')
      }
    } catch (error) {
      console.error('Failed to post:', error)
      alert('Failed to post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = tweetText.length
  const maxLength = 280

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-800">
      <div className="flex space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">?</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* User Info */}
          {session && (
            <div className="mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">
                  {session.user?.name || 'Anonymous'}
                </span>
                {userIsPremium && (
                  <span className="bg-bitchat-purple text-white text-xs px-2 py-1 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <div className="text-gray-400 text-sm">
                @{session.user?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
              </div>
            </div>
          )}

          {/* Tweet Input */}
          <div className="mb-3">
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={session ? "What's happening?" : "Sign in to post"}
              disabled={!session}
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none border-none outline-none text-xl min-h-[120px]"
              maxLength={maxLength}
            />
          </div>

          {/* NFT Options for Premium Users */}
          {isFocused && userIsPremium && (
            <div className="mb-4 p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="mintAsNFT"
                  checked={mintAsNFT}
                  onChange={(e) => setMintAsNFT(e.target.checked)}
                  className="rounded border-gray-600"
                />
                <label htmlFor="mintAsNFT" className="text-white">
                  <span className="font-medium">Mint as NFT</span>
                  <span className="text-gray-400 text-sm ml-2">
                    (Creates 1M tradable tokens)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Posting Cost for Free Users */}
          {isFocused && !userIsPremium && session && (
            <div className="mb-4 p-3 bg-gray-900 rounded-lg">
              <div className="text-yellow-400">
                <span className="font-medium">Posting Cost:</span>
                <span className="ml-2">{postingCost} BSV</span>
                <span className="text-gray-400 text-sm ml-2">
                  (Subscribe for free posting)
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isFocused && (
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 text-gray-400">
                <button type="button" className="hover:text-twitter-blue transition-colors">
                  📷 Media
                </button>
                <button type="button" className="hover:text-twitter-blue transition-colors">
                  📊
                </button>
                <button type="button" className="hover:text-twitter-blue transition-colors">
                  😀
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {/* Character Count */}
                <span className={`text-sm ${characterCount > maxLength * 0.9 ? 'text-red-400' : 'text-gray-400'}`}>
                  {characterCount}/{maxLength}
                </span>

                {/* Tweet Button */}
                <button
                  type="submit"
                  disabled={!tweetText.trim() || isSubmitting || characterCount > maxLength}
                  className="bg-twitter-blue hover:bg-twitter-dark-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-full transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

export default TweetComposer
