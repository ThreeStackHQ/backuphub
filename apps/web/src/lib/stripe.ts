import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2024-06-20' });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    databases: 1,
    backupsPerDay: 1,
    retentionDays: 7,
  },
  starter: {
    name: 'Starter',
    price: 9_00, // $9/mo
    databases: 5,
    backupsPerDay: 4,
    retentionDays: 30,
    priceId: process.env.STRIPE_PRICE_STARTER ?? '',
  },
  pro: {
    name: 'Pro',
    price: 29_00, // $29/mo
    databases: -1, // unlimited
    backupsPerDay: 24, // hourly
    retentionDays: 365,
    priceId: process.env.STRIPE_PRICE_PRO ?? '',
  },
} as const;

export type PlanTier = 'free' | 'business' | 'pro';
