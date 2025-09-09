import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './header'
import { Providers } from './providers'
import MiningBar from '@/components/MiningBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bitch@',
  description: 'Bitch@ - Decentralized Social Platform with NFT Posts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <Providers>
          <MiningBar />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
