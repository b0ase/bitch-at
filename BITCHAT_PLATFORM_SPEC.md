# Bitch@ Platform - Complete Technical Specification

## 🚀 Platform Overview

Bitch@ is a decentralized social media platform built on Bitcoin SV (BSV) with a unique token economics system. Every post is automatically minted as an NFT with 1 million tradable tokens. Users can sign in with any wallet and pay in any currency, making it truly wallet-agnostic.

### Core Philosophy
- **Wallet-Agnostic**: Users can connect any wallet (BSV, BTC, ETH, etc.)
- **Multi-Currency Payments**: Accept payments in any cryptocurrency
- **Token Economics**: Every social interaction (like/share) buys tokens
- **Platform-Owned Tokens**: Bitch@ owns 1% of every post's tokens
- **Real Bitcoin**: Built on BSV, the only true Bitcoin implementation

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js with multiple providers
- **Blockchain**: Bitcoin SV integration
- **Payments**: Multi-currency support (BSV, BTC, ETH, USD, EUR)

### Directory Structure
```
bitch-at/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # Admin panel pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── exchange/       # Token exchange/marketplace
│   │   ├── wallet/         # User wallet management
│   │   └── subscribe/      # Subscription management
│   ├── components/         # Reusable React components
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── TweetComposer.tsx # Post creation component
│   │   ├── Tweet.tsx       # Individual post display
│   │   └── Timeline.tsx    # Post feed component
│   └── lib/                # Utility libraries
│       ├── auth.ts         # NextAuth configuration
│       └── prisma.ts       # Database client
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js            # Database seeding script
└── public/                # Static assets
```

## 🔐 Dual Authentication System

### Authentication Providers
1. **Google OAuth** - For administrators (full Google Workspace access)
2. **Twitter OAuth** - For regular users (social features)
3. **Wallet Credentials** - For wallet-based authentication (any wallet type)

### Admin vs User Authentication
```typescript
// Admin users (Google OAuth)
session.user.isAdmin = true
// Full access to Google Workspace APIs
// Gmail, Drive, Docs, Sheets, YouTube, Analytics, Gemini

// Regular users (Twitter/Wallet)
session.user.isAdmin = false
// Social features, token trading, wallet management
```

## 🗄️ Database Schema

### Core Models

#### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  username      String?   @unique
  googleId      String?   @unique  // For admin users
  googleEmail   String?
  twitterId     String?   @unique  // For regular users
  twitterUsername String?
  isAdmin       Boolean   @default(false)
  isPremium     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  posts       Post[]
  likes       Like[]
  comments    Comment[]
  tokens      Token[]
  subscription Subscription?
  wallet      Wallet?
}
```

#### Post Model (NFT with Tokens)
```prisma
model Post {
  id              String    @id @default(cuid())
  content         String
  image           String?
  userId          String
  isPremium       Boolean   @default(false)
  nftId           String?   @unique
  totalTokenSupply Int      @default(1000000) // 1M tokens per post
  platformTokens  Int      @default(10000)   // Bitch@ owns 1%
  availableTokens Int      @default(990000)  // 99% available for trading
  tokenPrice      Float    @default(0.0001) // Base price in USD cents
  likeCost        Float    @default(0.0001) // 1 token per like
  shareCost       Float    @default(0.001)  // 10 tokens per share
  commentCost     Float    @default(0.001)  // Cost per comment
  acceptedCurrencies String @default("BSV,BTC,ETH,USD,EUR")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  comments Comment[]
  likes    Like[]
  tokens   Token[]
}
```

#### Token Ownership Model
```prisma
model Token {
  id          String   @id @default(cuid())
  postId      String
  ownerId     String
  amount      Int      @default(1)
  purchasePrice Float  @default(0.0001)
  acquiredVia  String? // 'like', 'share', 'purchase', 'platform'
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  post  Post @relation(fields: [postId], references: [id])
  owner User @relation(fields: [ownerId], references: [id])

  @@index([postId, ownerId])
}
```

#### Wallet Model (Multi-Currency)
```prisma
model Wallet {
  id          String   @id @default(cuid())
  userId      String   @unique
  walletType  String   @default("bsv") // bsv, btc, eth, etc.
  address     String   @unique
  balance     Float    @default(0)
  currency    String   @default("BSV")
  exchangeRate Float   @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([walletType, currency])
}
```

## 💰 Token Economics System

### Token Distribution
- **Total Supply per Post**: 1,000,000 tokens
- **Platform Ownership**: 1% (10,000 tokens)
- **Available for Trading**: 99% (990,000 tokens)
- **Platform Reserve**: Held for platform development and rewards

### Social Interaction Rewards
- **Like**: Costs 1/100th of a penny = 1 token purchased
- **Share**: Costs 1/10th of a penny = 10 tokens purchased
- **Comment**: Costs 1/100th of a penny (configurable)

### Currency Conversion
```typescript
// Example conversion logic
const usdCost = 0.0001 // 1/100th of a penny
const userCurrency = wallet.currency || 'BSV'
const exchangeRate = wallet.exchangeRate || 1

// Convert to user's preferred currency
const tokenCost = userCurrency === 'BSV'
  ? usdCost * 50 // ~$50 per BSV
  : usdCost / exchangeRate
```

## 🔌 API Endpoints

### Authentication APIs
```
POST /api/auth/signin/google     # Admin sign-in
POST /api/auth/signin/twitter    # User sign-in
POST /api/auth/signin/credentials # Wallet sign-in
GET  /api/auth/session           # Get current session
POST /api/auth/signout           # Sign out
```

### Post Management APIs
```
GET  /api/posts                  # Get all posts (paginated)
POST /api/posts                  # Create new post
GET  /api/posts/[id]             # Get specific post
PUT  /api/posts/[id]             # Update post
DELETE /api/posts/[id]           # Delete post
```

### Social Interaction APIs
```
POST /api/posts/like             # Like post (buys 1 token)
POST /api/posts/share            # Share post (buys 10 tokens)
POST /api/posts/comment          # Comment on post
DELETE /api/posts/like           # Unlike post (refunds token)
DELETE /api/posts/share          # Unshare post (refunds tokens)
```

### Token Trading APIs
```
GET  /api/exchange               # Get all tradable tokens
GET  /api/exchange/[postId]      # Get specific post tokens
POST /api/exchange/buy           # Buy tokens
POST /api/exchange/sell          # Sell tokens
GET  /api/exchange/portfolio     # User's token portfolio
```

### Wallet & Payment APIs
```
GET  /api/wallet                 # Get user wallet info
POST /api/wallet/deposit         # Deposit funds
POST /api/wallet/withdraw        # Withdraw funds
GET  /api/exchange-rates         # Get currency exchange rates
POST /api/wallet/convert         # Convert currencies
```

### Admin APIs
```
GET  /api/admin/status           # Check admin status
GET  /api/admin/users            # Get all users
GET  /api/admin/posts            # Get all posts
GET  /api/admin/analytics        # Platform analytics
POST /api/admin/user/ban         # Ban user
POST /api/admin/post/remove      # Remove post
```

## 🎨 Frontend Components

### Core Components

#### TweetComposer
```tsx
interface TweetComposerProps {
  onPost?: (post: Post) => void
  placeholder?: string
  maxLength?: number
}

// Features:
// - Rich text input with character counter
// - Image/media upload
// - NFT minting option (premium users)
// - Token cost display
// - Posting cost calculation
```

#### Tweet Component
```tsx
interface TweetProps {
  tweet: TweetData
  onLike?: (tweetId: string) => void
  onRetweet?: (tweetId: string) => void
  onReply?: (tweetId: string) => void
  showTokenInfo?: boolean
}

// Features:
// - Post content display
// - User avatar and info
// - Like/share buttons with token costs
// - NFT badge display
// - Token ownership info
```

#### Timeline Component
```tsx
interface TimelineProps {
  userId?: string
  showTokenPrices?: boolean
  filterBy?: 'all' | 'following' | 'trending'
}

// Features:
// - Infinite scroll
// - Real-time updates
// - Token price integration
// - Social interaction tracking
```

### Admin Components

#### AdminBar
```tsx
// Only visible to admin users
// Positioned above main navbar
// Quick access to admin functions
// Google Workspace status indicator
```

#### AdminPanel
```tsx
interface AdminPanelProps {
  activeTab?: 'dashboard' | 'users' | 'posts' | 'analytics'
}

// Features:
// - User management
// - Content moderation
// - Analytics dashboard
// - Google Workspace integration
// - Platform settings
```

## 💳 Subscription System

### Subscription Tiers
```typescript
interface SubscriptionTier {
  name: string
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  tokenBonus: number // Extra tokens for subscribers
}
```

### Tiers:
1. **Free**: Basic posting, limited features
2. **Premium**: Unlimited posting, NFT minting, token trading
3. **Enterprise**: White-label, API access, advanced analytics

### Subscription Features:
- **Credit Card Payments**: Stripe integration
- **Token Bonuses**: Extra tokens for subscribers
- **Premium Posting**: Free posting for subscribers
- **Advanced Analytics**: Detailed usage stats
- **API Access**: Programmatic platform access

## 🔄 Exchange/Marketplace

### Token Trading Features
- **Real-time Pricing**: Live token prices
- **Order Book**: Buy/sell orders
- **Portfolio Tracking**: User's token holdings
- **Transaction History**: Complete trading history
- **Multi-currency Support**: Trade in any supported currency

### Exchange API
```typescript
interface TokenOrder {
  postId: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  currency: string
  userId: string
}

interface TokenTransaction {
  id: string
  postId: string
  buyerId: string
  sellerId: string
  amount: number
  price: number
  currency: string
  timestamp: Date
}
```

## 🚀 Deployment & Production

### Environment Variables
```bash
# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
NEXTAUTH_SECRET="secure-random-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Payments
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Blockchain
BSV_PRIVATE_KEY="your-bsv-private-key"
BSV_NETWORK="mainnet"
```

### Production Checklist
- [ ] Set up PostgreSQL database
- [ ] Configure Redis for sessions (optional)
- [ ] Set up Stripe webhooks
- [ ] Configure Google OAuth credentials
- [ ] Set up Twitter OAuth credentials
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup systems
- [ ] Set up CDN for static assets

## 🎯 Key Implementation Notes

### Wallet-Agnostic Design
1. **Flexible Wallet Integration**: Support any wallet type
2. **Currency Conversion**: Real-time exchange rate integration
3. **Transaction Fees**: Users pay their own transaction fees
4. **Multi-signature**: Platform can co-sign transactions for security

### Token Economics Implementation
1. **Automatic Token Creation**: Every post creates 1M tokens
2. **Platform Reserve**: 1% held by Bitch@ automatically
3. **Social Rewards**: Likes/shares automatically buy tokens
4. **Market Dynamics**: Token prices fluctuate based on engagement

### Admin Panel Features
1. **Google Workspace Integration**: Full access to Gmail, Drive, etc.
2. **User Management**: Ban users, moderate content
3. **Analytics Dashboard**: Platform metrics and insights
4. **Content Moderation**: Remove posts, manage comments
5. **Subscription Management**: Handle payments and billing

### Security Considerations
1. **Admin Role Protection**: Strict admin user validation
2. **API Rate Limiting**: Prevent abuse of endpoints
3. **Input Validation**: Sanitize all user inputs
4. **CSRF Protection**: Secure form submissions
5. **Audit Logging**: Track all admin actions

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push
npm run db:seed

# Start development server
npm run dev

# Build for production
npm run build
npm start

# Database management
npx prisma studio    # Open database GUI
npx prisma migrate   # Create migrations
npm run db:seed      # Seed database
```

## 📊 Platform Metrics & KPIs

### User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average Session Duration
- Post Creation Rate
- Token Trading Volume

### Economic Metrics
- Total Tokens Created
- Platform Token Holdings
- Trading Volume (by currency)
- Subscription Revenue
- Transaction Fees Collected

### Technical Metrics
- API Response Times
- Error Rates
- Database Query Performance
- Blockchain Transaction Success Rate

This specification provides a complete technical overview for building out the Bitch@ platform. The wallet-agnostic, multi-currency approach combined with the unique token economics system creates a truly innovative social media platform built on real Bitcoin (BSV).
