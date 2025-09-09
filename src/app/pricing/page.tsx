'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function PricingPage() {
  const { data: session } = useSession()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Post with Twitter handle',
        'Basic timeline access',
        'Limited storage',
        'Community support',
      ],
      limitations: [
        '0.001 BSV posting cost',
        '0.001 BSV comment cost',
        'No NFT minting',
        'Limited API access',
      ],
      buttonText: 'Current Plan',
      popular: false,
    },
    {
      name: 'Premium',
      price: { monthly: 9.99, yearly: 99.99 },
      features: [
        'Free unlimited posting',
        'Free unlimited commenting',
        'NFT post minting',
        '1M tokens per NFT post',
        'Marketplace access',
        'Priority support',
        'Advanced analytics',
        'Custom themes',
      ],
      limitations: [],
      buttonText: 'Upgrade to Premium',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: 29.99, yearly: 299.99 },
      features: [
        'Everything in Premium',
        'White-label options',
        'API access (1000 req/min)',
        'Dedicated support',
        'Custom integrations',
        'Advanced moderation tools',
        'Team management',
        'Bulk operations',
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      popular: false,
    },
  ]

  const handleSubscribe = (planName: string) => {
    if (!session) {
      alert('Please sign in to subscribe')
      return
    }

    if (planName === 'Enterprise') {
      // TODO: Contact sales form
      alert('Contact sales for Enterprise plan')
      return
    }

    // TODO: Implement Stripe checkout
    alert(`Subscribe to ${planName} - ${billingCycle} plan`)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400 mb-8">
            Unlock the full power of Bitch@ with premium features
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-twitter-blue text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-twitter-blue text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-600 px-2 py-1 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-gray-900 rounded-lg p-8 relative ${
                plan.popular ? 'border-2 border-twitter-blue' : 'border border-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-twitter-blue text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  ${plan.price[billingCycle]}
                  {plan.price[billingCycle] > 0 && (
                    <span className="text-lg text-gray-400">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <div className="text-sm text-green-400">
                    Save ${(plan.price.monthly * 12 - plan.price.yearly).toFixed(2)} annually
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-green-400">✓ What's Included</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-1">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-semibold mb-4 text-red-400">✗ Limitations</h4>
                  <ul className="space-y-3">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-400 mr-3 mt-1">✗</span>
                        <span className="text-gray-400">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(plan.name)}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.name === 'Free'
                    ? 'bg-gray-700 text-gray-300 cursor-default'
                    : plan.popular
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                disabled={plan.name === 'Free'}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">What is NFT post minting?</h3>
              <p className="text-gray-400">
                Premium users can mint their posts as NFTs, creating 1 million tradable tokens that represent ownership in their content. These tokens can be bought and sold on our marketplace.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">How does the BSV payment system work?</h3>
              <p className="text-gray-400">
                Free users pay small BSV fees (0.001 BSV) for posting and commenting. Premium users get unlimited free posting and commenting, plus NFT minting capabilities.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-400">
                Yes! You can cancel your subscription at any time. You'll continue to have premium access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
