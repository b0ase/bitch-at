import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string
      googleEmail?: string
      twitterUsername?: string
      isAdmin?: boolean
      walletType?: string
      walletAddress?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    username?: string
    googleEmail?: string
    isAdmin?: boolean
    walletType?: string
    walletAddress?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    provider?: string
    username?: string
    googleId?: string
    googleEmail?: string
    twitterId?: string
    twitterUsername?: string
    isAdmin?: boolean
    walletType?: string
    walletAddress?: string
  }
}
