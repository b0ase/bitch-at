/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bitchat-purple': '#8b5cf6',
        'bitchat-pink': '#ec4899',
        'twitter-blue': '#1da1f2',
        'twitter-black': '#14171a',
        'twitter-dark-gray': '#657786',
        'twitter-light-gray': '#aab8c2',
        'twitter-extra-light-gray': '#e1e8ed',
        'twitter-dark-hover': '#1a91da',
      },
    },
  },
  plugins: [],
}
