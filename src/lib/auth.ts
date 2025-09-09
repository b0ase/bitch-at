import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import GoogleProvider from 'next-auth/providers/google'
import TwitterProvider from 'next-auth/providers/twitter'
import CredentialsProvider from 'next-auth/providers/credentials'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://mail.google.com/ https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/analytics.readonly'
        }
      }
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
    }),
    // Wallet-agnostic sign-in - users can connect any wallet
    CredentialsProvider({
      name: 'Wallet',
      credentials: {
        walletAddress: { label: 'Wallet Address', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
        message: { label: 'Message', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) return null

        // Create or find user by wallet address
        const user = await prisma.user.upsert({
          where: { email: `${credentials.walletAddress}@wallet.bitchat` },
          update: {},
          create: {
            email: `${credentials.walletAddress}@wallet.bitchat`,
            name: `Wallet ${credentials.walletAddress.slice(0, 8)}...`,
            username: credentials.walletAddress.slice(0, 8),
          },
        })

        return {
          id: user.id,
          email: user.email || undefined,
          name: user.name || undefined,
          username: user.username || undefined,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = token.sub || user.id

        // Handle different providers
        if (token.provider === 'google') {
          session.user.username = user.email?.split('@')[0] || 'admin'
          session.user.googleEmail = user.email
          session.user.isAdmin = true
          session.user.walletType = 'google'
        } else if (token.provider === 'twitter') {
          session.user.username = (user as any).username || user.name?.toLowerCase().replace(/\s+/g, '') || 'user'
          session.user.twitterUsername = (user as any).username
          session.user.isAdmin = false
          session.user.walletType = 'twitter'
        } else if (token.provider === 'credentials') {
          session.user.username = user.email?.split('@')[0] || 'wallet-user'
          session.user.walletAddress = user.email?.split('@')[0]
          session.user.isAdmin = false
          session.user.walletType = 'wallet'
        }
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.provider = account?.provider
      }

      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as any
        token.googleId = googleProfile.sub
        token.googleEmail = googleProfile.email
        token.username = googleProfile.email?.split('@')[0]
        token.isAdmin = true
        token.walletType = 'google'
      } else if (account?.provider === 'twitter' && profile) {
        const twitterProfile = profile as any
        token.twitterId = twitterProfile.id
        token.twitterUsername = twitterProfile.username
        token.username = twitterProfile.username
        token.isAdmin = false
        token.walletType = 'twitter'
      } else if (account?.provider === 'credentials') {
        token.username = user.email?.split('@')[0]
        token.walletAddress = user.email?.split('@')[0]
        token.isAdmin = false
        token.walletType = 'wallet'
      }
      return token
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as any
        const extendedUser = user as any
        extendedUser.googleId = googleProfile.sub
        extendedUser.googleEmail = googleProfile.email
        extendedUser.username = googleProfile.email?.split('@')[0]
        extendedUser.isAdmin = true
        extendedUser.walletType = 'google'
      } else if (account?.provider === 'twitter' && profile) {
        const twitterProfile = profile as any
        const extendedUser = user as any
        extendedUser.twitterId = twitterProfile.id
        extendedUser.twitterUsername = twitterProfile.username
        extendedUser.username = twitterProfile.username
        extendedUser.isAdmin = false
        extendedUser.walletType = 'twitter'
      } else if (account?.provider === 'credentials') {
        const extendedUser = user as any
        extendedUser.walletAddress = user.email?.split('@')[0]
        extendedUser.isAdmin = false
        extendedUser.walletType = 'wallet'
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
