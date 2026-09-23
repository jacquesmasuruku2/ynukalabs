import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { PREMIUM_PLAN_CONFIG, getPremiumPlan } from '@/lib/admin-premium';

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

async function getNowPaymentsCheckoutUrl(adminUserId: string, adminUserEmail: string, plan: string) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const apiUrl = process.env.NOWPAYMENTS_API_URL;

  if (!apiKey || !apiUrl) return null;

  const baseUrl = getPremiumBaseUrl();
  const premiumPlan = getPremiumPlan(plan);
  const config = PREMIUM_PLAN_CONFIG[premiumPlan];
  const orderId = `premium-${premiumPlan}-${adminUserId}-${Date.now()}`;

  const response = await fetch(`${apiUrl.replace(/\/$/, '')}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      price_amount: config.price,
      price_currency: 'usd',
      pay_currency: 'usdt',
      order_id: orderId,
      order_description: `Premium access - ${premiumPlan} - ${adminUserEmail}`,
      ipn_callback_url: `${baseUrl}/api/admin/premium/notify`,
      success_url: `${baseUrl}/settings?premium=success&plan=${premiumPlan}`,
      cancel_url: `${baseUrl}/settings?premium=cancelled&plan=${premiumPlan}`,
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

export async function GET(request: NextRequest) {
  const { response, session } = await requireAdmin();
  if (response) return response;

  const checkoutUrl = process.env.STRIPE_CHECKOUT_URL || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL;
  if (checkoutUrl) {
    return NextResponse.redirect(checkoutUrl);
  }

  const plan = request.nextUrl.searchParams.get('plan') || 'monthly';

  try {
    const nowPaymentsCheckoutUrl = await getNowPaymentsCheckoutUrl(session!.adminUser.id, session!.adminUser.email, plan);
    if (!nowPaymentsCheckoutUrl) {
      return NextResponse.json(
        { error: 'Le lien de paiement Premium n’est pas encore configuré.' },
        { status: 503 },
      );
    }

    return NextResponse.redirect(nowPaymentsCheckoutUrl);
  } catch (error) {
    console.error('Premium checkout init failed:', error);
    const message = error instanceof Error && /INVALID_API_KEY|403|forbidden/i.test(error.message)
      ? 'Le paiement Premium est temporairement indisponible. Vérifiez la clé NOWPayments du serveur.'
      : 'Le paiement Premium est indisponible pour le moment.';

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
