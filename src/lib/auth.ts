import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import GoogleProvider from 'next-auth/providers/google'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/analytics.readonly'
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = token.sub || user.id
        session.user.username = user.email?.split('@')[0] || user.name?.toLowerCase().replace(/\s+/g, '') || 'user'
        session.user.googleEmail = user.email
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.username = user.email?.split('@')[0] || user.name?.toLowerCase().replace(/\s+/g, '')
        token.googleEmail = user.email
      }
      if (account?.provider === 'google' && profile) {
        const googleProfile = profile as any
        token.googleId = googleProfile.sub
        token.googleEmail = googleProfile.email
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
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
