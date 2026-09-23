export const stripeConfig = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  priceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID || '',
  checkoutUrl: process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_URL || '',
  portalUrl: process.env.EXPO_PUBLIC_STRIPE_PORTAL_URL || '',
  superAdminEmails: (process.env.EXPO_PUBLIC_SUPER_ADMIN_EMAILS || 'jacquesmasuruku2@gmail.com')
    .split(/[;,\n]+/)
    .map((email: string) => email.trim().toLowerCase())
    .filter(Boolean),
};

export function hasStripeConfig() {
  return Boolean(stripeConfig.publishableKey || stripeConfig.checkoutUrl || stripeConfig.priceId);
}

export function hasPremiumAccessForEmail(email?: string | null) {
  const normalized = (email || '').trim().toLowerCase();
  return stripeConfig.superAdminEmails.includes(normalized);
}
