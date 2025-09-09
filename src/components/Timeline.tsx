'use client'

import React, { useState, useEffect } from 'react'
import Tweet from './Tweet'

interface Post {
  id: string
  content: string
  image?: string
  userId: string
  isPremium: boolean
  nftId?: string
  createdAt: string
  user: {
    id: string
    name: string
    username?: string
    image?: string
    verified?: boolean
  }
  likes: { id: string }[]
  comments: { id: string }[]
}

const Timeline = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      } else {
        setError('Failed to load posts')
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const convertToTweet = (post: Post) => ({
    id: post.id,
    user: {
      id: post.user.id,
      name: post.user.name,
      username: post.user.username || post.user.name.toLowerCase().replace(/\s+/g, ''),
      avatar: post.user.image || '',
      verified: post.user.verified || false,
    },
    content: post.content,
    timestamp: new Date(post.createdAt).toISOString(),
    likes: post.likes.length,
    retweets: 0, // For now, we'll implement this later
    replies: post.comments.length,
    images: post.image ? [post.image] : [],
    isLiked: false, // For now, we'll implement this later
    isRetweeted: false,
    isPremium: post.isPremium,
    nftId: post.nftId,
  })

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-twitter-blue mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading posts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchPosts}
          className="bg-twitter-blue hover:bg-twitter-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400 mb-4">No posts yet. Be the first to post!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-800">
      {posts.map((post) => (
        <Tweet
          key={post.id}
          tweet={convertToTweet(post)}
          onLike={(tweetId) => {
            // TODO: Implement like functionality
            console.log('Like tweet:', tweetId)
          }}
          onRetweet={(tweetId) => {
            // TODO: Implement retweet functionality
            console.log('Retweet tweet:', tweetId)
          }}
          onReply={(tweetId) => {
            // TODO: Implement reply functionality
            console.log('Reply to tweet:', tweetId)
          }}
        />
      ))}
    </div>
  )
}

export default Timeline
