import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';

type NowPaymentsPaymentResponse = {
  payment_url?: string;
  pay_url?: string;
  url?: string;
  payment_id?: string | number;
  pay_address?: string;
  order_id?: string;
  status?: string;
};

function getPremiumBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.ADMIN_PANEL_URL ||
    process.env.PUBLIC_SITE_URL ||
    'https://admin.ynukalabs.com'
  ).replace(/\/$/, '');
}

async function getNowPaymentsCheckoutUrl() {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const apiUrl = process.env.NOWPAYMENTS_API_URL;

  if (!apiKey || !apiUrl) return null;

  const baseUrl = getPremiumBaseUrl();
  const premiumPrice = Number(process.env.PREMIUM_PRICE_USD ?? 29);
  const orderId = `premium-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      price_amount: Number.isFinite(premiumPrice) && premiumPrice > 0 ? premiumPrice : 29,
      price_currency: 'usd',
      pay_currency: 'usdt',
      order_id: orderId,
      order_description: 'Premium access for Ynuka Labs admin panel',
      ipn_callback_url: `${baseUrl}/api/admin/premium/notify`,
      success_url: `${baseUrl}/settings?premium=success`,
      cancel_url: `${baseUrl}/settings?premium=cancelled`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NOWPayments checkout failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as NowPaymentsPaymentResponse;

  return (
    data.payment_url ||
    data.pay_url ||
    data.url ||
    (data.payment_id ? `https://nowpayments.io/payment/?iid=${data.payment_id}` : null)
  );
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const checkoutUrl = process.env.STRIPE_CHECKOUT_URL || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL;
  if (checkoutUrl) {
    return NextResponse.redirect(checkoutUrl);
  }

  try {
    const nowPaymentsCheckoutUrl = await getNowPaymentsCheckoutUrl();
    if (!nowPaymentsCheckoutUrl) {
      return NextResponse.json(
        { error: 'Le lien de paiement Premium n’est pas encore configuré.' },
        { status: 503 },
      );
    }

    return NextResponse.redirect(nowPaymentsCheckoutUrl);
  } catch (error) {
    console.error('Premium checkout init failed:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Le paiement Premium est indisponible pour le moment.',
      },
      { status: 503 },
    );
  }
}
