import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import TwitterProvider from 'next-auth/providers/twitter'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = token.sub || user.id
        session.user.username = user.username as string | undefined
        session.user.twitterUsername = user.twitterUsername as string | undefined
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.twitterUsername = (user as any).twitterUsername
      }
      if (account?.provider === 'twitter' && profile) {
        const twitterProfile = profile as any
        token.twitterId = twitterProfile.id
        token.twitterUsername = twitterProfile.username
        token.username = twitterProfile.username
      }
      return token
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'twitter' && profile) {
        const twitterProfile = profile as any
        const extendedUser = user as any
        extendedUser.twitterId = twitterProfile.id
        extendedUser.twitterUsername = twitterProfile.username
        extendedUser.username = twitterProfile.username
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
