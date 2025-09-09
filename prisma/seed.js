const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user (you'll need to update this with your actual Google ID)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bitchat.com' },
    update: {},
    create: {
      name: 'Bitch@ Admin',
      email: 'admin@bitchat.com',
      username: 'bitchat_admin',
      isAdmin: true,
      isPremium: true,
    },
  })

  // Create sample posts
  const posts = [
    {
      content: '🚀 Welcome to Bitch@ - The Real Bitcoin Social Platform! Built on BSV with NFT posts and micro-payments. Time to troll Jack Dorsey\'s BitChat! 💎',
      userId: adminUser.id,
      isPremium: true,
    },
    {
      content: 'Just minted my first NFT post on Bitch@! This post comes with 1M tradable tokens. Who wants to buy some? #BSV #NFT #RealBitcoin',
      userId: adminUser.id,
      isPremium: true,
    },
    {
      content: 'Bitcoin SV is the only real Bitcoin. Everything else is just vaporware from people who couldn\'t scale. BSV scales to billions of users! ⚡',
      userId: adminUser.id,
      isPremium: false,
    },
    {
      content: 'Micro-payments for comments and posts make social media sustainable. No more ads, no more censorship. Just real conversations on real money.',
      userId: adminUser.id,
      isPremium: true,
    },
  ]

  for (const post of posts) {
    await prisma.post.create({
      data: post,
    })
  }

  // Create sample wallet for admin
  await prisma.wallet.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      address: '1BitcoinEaterAddressDontSendf59kuE',
      balance: 0.042,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user created with email: admin@bitchat.com')
  console.log('📝 Created 4 sample posts')
  console.log('💰 Created wallet with 0.042 BSV balance')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
