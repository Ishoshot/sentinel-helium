/**
 * Plan Configuration - Single Source of Truth
 *
 * This file defines all plan data for the frontend.
 * Must stay in sync with backend docs/product/PLANS_AND_LIMITS.md
 *
 * Plan tiers and their details:
 * | Plan        | Monthly | Runs/Month | Team Size | Support   |
 * |-------------|---------|------------|-----------|-----------|
 * | Foundation  | $0      | 20         | 2         | Community |
 * | Illuminate  | $20     | 500        | 5         | Email     |
 * | Orchestrate | $50     | 2,000      | Unlimited | Priority  |
 * | Sanctum     | $200    | Unlimited  | Unlimited | Dedicated |
 */

import type { PlanTier } from '~/types'

export interface PlanConfig {
  tier: PlanTier
  name: string
  price: number | null
  priceLabel: string
  period: string
  description: string
  runsPerMonth: number | null
  runsLabel: string
  teamSize: number | null
  teamSizeLabel: string
  support: string
  features: string[]
  highlighted: boolean
  cta: string
  ctaLink: string
  color: 'slate' | 'blue' | 'purple' | 'amber'
}

export const planConfigs: PlanConfig[] = [
  {
    tier: 'foundation',
    name: 'Foundation',
    price: 0,
    priceLabel: '$0',
    period: 'Free forever',
    description: 'Perfect for personal projects and trying out Sentinel.',
    runsPerMonth: 20,
    runsLabel: '20',
    teamSize: 2,
    teamSizeLabel: '2',
    support: 'Community',
    features: [
      '20 reviews per month',
      '2 team members',
      'GitHub integration',
      'Basic findings',
    ],
    highlighted: false,
    cta: 'Start free',
    ctaLink: '/login',
    color: 'slate',
  },
  {
    tier: 'illuminate',
    name: 'Illuminate',
    price: 20,
    priceLabel: '$20',
    period: 'per month',
    description: 'For growing teams wanting deeper insights.',
    runsPerMonth: 500,
    runsLabel: '500',
    teamSize: 5,
    teamSizeLabel: '5',
    support: 'Email',
    features: [
      '500 reviews per month',
      '5 team members',
      'Custom guidelines',
      'Priority processing',
    ],
    highlighted: true,
    cta: 'Get started',
    ctaLink: '/login',
    color: 'blue',
  },
  {
    tier: 'orchestrate',
    name: 'Orchestrate',
    price: 50,
    priceLabel: '$50',
    period: 'per month',
    description: 'For professional teams at scale.',
    runsPerMonth: 2000,
    runsLabel: '2,000',
    teamSize: null,
    teamSizeLabel: 'Unlimited',
    support: 'Priority',
    features: [
      '2,000 reviews per month',
      'Unlimited members',
      'API access',
      'Advanced analytics',
    ],
    highlighted: false,
    cta: 'Get started',
    ctaLink: '/login',
    color: 'purple',
  },
  {
    tier: 'sanctum',
    name: 'Sanctum',
    price: 200,
    priceLabel: '$200',
    period: 'per month',
    description: 'For organizations requiring governance.',
    runsPerMonth: null,
    runsLabel: 'Unlimited',
    teamSize: null,
    teamSizeLabel: 'Unlimited',
    support: 'Dedicated',
    features: [
      'Unlimited reviews',
      'Unlimited members',
      'SSO & SAML',
      'Audit logs',
    ],
    highlighted: false,
    cta: 'Contact sales',
    ctaLink: 'mailto:hello@usesentinel.ai',
    color: 'amber',
  },
]

/**
 * Feature comparison matrix for plan comparison tables
 */
export interface ComparisonFeature {
  name: string
  foundation: string | boolean
  illuminate: string | boolean
  orchestrate: string | boolean
  sanctum: string | boolean
}

export const comparisonFeatures: ComparisonFeature[] = [
  { name: 'Reviews per month', foundation: '20', illuminate: '500', orchestrate: '2,000', sanctum: 'Unlimited' },
  { name: 'Team members', foundation: '2', illuminate: '5', orchestrate: 'Unlimited', sanctum: 'Unlimited' },
  { name: 'GitHub integration', foundation: true, illuminate: true, orchestrate: true, sanctum: true },
  { name: 'Provider keys (BYOK)', foundation: true, illuminate: true, orchestrate: true, sanctum: true },
  { name: 'Custom guidelines', foundation: false, illuminate: true, orchestrate: true, sanctum: true },
  { name: 'Priority queue', foundation: false, illuminate: true, orchestrate: true, sanctum: true },
  { name: 'API access', foundation: false, illuminate: false, orchestrate: true, sanctum: true },
  { name: 'SSO / SAML', foundation: false, illuminate: false, orchestrate: false, sanctum: true },
  { name: 'Audit logs', foundation: false, illuminate: false, orchestrate: false, sanctum: true },
  { name: 'Dedicated support', foundation: false, illuminate: false, orchestrate: false, sanctum: true },
]

/**
 * Get a plan config by tier
 */
export function getPlanByTier(tier: PlanTier): PlanConfig | undefined {
  return planConfigs.find(p => p.tier === tier)
}

/**
 * Get the highlighted/popular plan
 */
export function getHighlightedPlan(): PlanConfig | undefined {
  return planConfigs.find(p => p.highlighted)
}
