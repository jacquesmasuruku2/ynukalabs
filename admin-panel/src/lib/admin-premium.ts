export type PremiumPlan = 'monthly' | 'annual';

export const PREMIUM_PLAN_CONFIG: Record<PremiumPlan, { label: string; price: number; intervalLabel: string; days: number }> = {
  monthly: { label: 'Premium mensuel', price: 5, intervalLabel: '5 $ / mois', days: 30 },
  annual: { label: 'Premium annuel', price: 39, intervalLabel: '39 $ / an', days: 365 },
};

export function getPremiumPlan(plan?: string | null): PremiumPlan {
  return plan === 'annual' ? 'annual' : 'monthly';
}

export function getPremiumExpiryDate(plan?: string | null, from = new Date()) {
  const premiumPlan = getPremiumPlan(plan);
  const ms = PREMIUM_PLAN_CONFIG[premiumPlan].days * 24 * 60 * 60 * 1000;
  return new Date(from.getTime() + ms);
}

export function isPremiumAccessActive(
  user?: {
    isSuperAdmin?: boolean;
    isPremium?: boolean;
    premiumExpiresAt?: Date | string | null;
  } | null,
  now = new Date(),
) {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  if (!user.isPremium || !user.premiumExpiresAt) return false;
  return new Date(user.premiumExpiresAt) > now;
}
