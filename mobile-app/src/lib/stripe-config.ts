export const stripeConfig = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  priceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID || '',
  checkoutUrl: process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_URL || '',
  portalUrl: process.env.EXPO_PUBLIC_STRIPE_PORTAL_URL || '',
};

export function hasStripeConfig() {
  return Boolean(stripeConfig.publishableKey || stripeConfig.checkoutUrl || stripeConfig.priceId);
}
