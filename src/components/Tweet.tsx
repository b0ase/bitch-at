'use client'

import React, { useState } from 'react'

interface TweetData {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
    verified?: boolean
  }
  content: string
  timestamp: string
  likes: number
  retweets: number
  replies: number
  images: string[]
  isLiked: boolean
  isRetweeted: boolean
  isPremium?: boolean
  nftId?: string
}

interface TweetProps {
  tweet: TweetData
  onLike?: (tweetId: string) => void
  onRetweet?: (tweetId: string) => void
  onReply?: (tweetId: string) => void
}

const Tweet = ({ tweet, onLike, onRetweet, onReply }: TweetProps) => {
  const [isLiked, setIsLiked] = useState(tweet.isLiked)
  const [isRetweeted, setIsRetweeted] = useState(tweet.isRetweeted)
  const [likeCount, setLikeCount] = useState(tweet.likes)
  const [retweetCount, setRetweetCount] = useState(tweet.retweets)

  const handleLike = () => {
    if (onLike) {
      onLike(tweet.id)
    } else {
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    }
  }

  const handleRetweet = () => {
    if (onRetweet) {
      onRetweet(tweet.id)
    } else {
      setIsRetweeted(!isRetweeted)
      setRetweetCount(prev => isRetweeted ? prev - 1 : prev + 1)
    }
  }

  const handleReply = () => {
    if (onReply) {
      onReply(tweet.id)
    }
  }

  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const tweetDate = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - tweetDate.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  return (
    <article className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors cursor-pointer">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {tweet.user.avatar ? (
            <img
              src={tweet.user.avatar}
              alt={tweet.user.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">
                {tweet.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-white truncate">
              {tweet.user.name}
            </h3>
            {tweet.user.verified && (
              <svg className="w-5 h-5 text-twitter-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-gray-400 text-sm">
              @{tweet.user.username}
            </span>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-400 text-sm">
              {getRelativeTime(tweet.timestamp)}
            </span>
          </div>

          {/* Premium Badge */}
          {tweet.isPremium && (
            <div className="inline-flex items-center bg-bitchat-purple text-white text-xs px-2 py-1 rounded-full mb-2">
              <span className="mr-1">💎</span>
              Premium
            </div>
          )}

          {/* Content */}
          <div className="text-white mb-3 whitespace-pre-wrap break-words">
            {tweet.content}
          </div>

          {/* Images */}
          {tweet.images && tweet.images.length > 0 && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-700">
              <img
                src={tweet.images[0]}
                alt="Tweet image"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* NFT Badge */}
          {tweet.nftId && (
            <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full mb-3">
              <span className="mr-1">🎨</span>
              NFT #{tweet.nftId.slice(0, 8)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between max-w-md">
            {/* Reply */}
            <button
              onClick={handleReply}
              className="flex items-center space-x-2 text-gray-400 hover:text-twitter-blue transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="text-sm">{tweet.replies}</span>
            </button>

            {/* Retweet */}
            <button
              onClick={handleRetweet}
              className={`flex items-center space-x-2 hover:text-green-400 transition-colors group ${
                isRetweeted ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              <svg className="w-5 h-5 group-hover:fill-current" fill={isRetweeted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">{retweetCount}</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 hover:text-red-400 transition-colors group ${
                isLiked ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              <svg className="w-5 h-5 group-hover:fill-current" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{likeCount}</span>
            </button>

            {/* Share */}
            <button className="flex items-center space-x-2 text-gray-400 hover:text-twitter-blue transition-colors group">
              <svg className="w-5 h-5 group-hover:fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default Tweet
