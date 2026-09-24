import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { createNowPaymentsPayment, nowpaymentsRequest } from '@/lib/nowpayments';
import { PREMIUM_PLAN_CONFIG, getPremiumPlan } from '@/lib/admin-premium';

function getPremiumBaseUrl() {
  const configuredBaseUrl = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.ADMIN_PANEL_URL,
    process.env.PUBLIC_SITE_URL,
  ].find((value) => value && !/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value));

  return (configuredBaseUrl || 'https://admin.ynukalabs.com').replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  const { response, session } = await requireAdmin();
  if (response) return response;

  const plan = request.nextUrl.searchParams.get('plan') || 'monthly';
  const payCurrency = request.nextUrl.searchParams.get('pay_currency') || 'ada';
  const premiumPlan = getPremiumPlan(plan);
  const config = PREMIUM_PLAN_CONFIG[premiumPlan];
  const baseUrl = getPremiumBaseUrl();
  const orderId = `nowpayments-${premiumPlan}-${session!.adminUser.id}-${Date.now()}`;

  try {
    const payment = await createNowPaymentsPayment({
      amount: config.price,
      currency: 'usd',
      payCurrency,
      orderId,
      description: `Premium access - ${premiumPlan}`,
      callbackUrl: `${baseUrl}/api/admin/premium/nowpayments/webhook`,
      successUrl: `${baseUrl}/settings?premium=success`,
      cancelUrl: `${baseUrl}/settings?premium=cancelled`,
    });

    return NextResponse.json({
      ok: true,
      orderId,
      payment,
      paymentUrl: payment.payment_url || payment.invoice_url || payment.url || payment.pay_address || null,
    });
  } catch (error) {
    console.error('NOWPayments checkout creation failed:', error);
    return NextResponse.json({
      ok: false,
      message: 'Cette fonctionnalité est actuellement en cours de développement.',
    }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const { response, session } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const plan = getPremiumPlan(body?.plan || 'monthly');
    const config = PREMIUM_PLAN_CONFIG[plan];
    const baseUrl = getPremiumBaseUrl();
    const orderId = `nowpayments-${plan}-${session!.adminUser.id}-${Date.now()}`;

    const payment = await createNowPaymentsPayment({
      amount: Number(body?.amount ?? config.price),
      currency: String(body?.currency || 'usd'),
      payCurrency: String(body?.pay_currency || 'ada'),
      orderId,
      description: String(body?.description || `Premium access - ${plan}`),
      callbackUrl: `${baseUrl}/api/admin/premium/nowpayments/webhook`,
      successUrl: `${baseUrl}/settings?premium=success`,
      cancelUrl: `${baseUrl}/settings?premium=cancelled`,
    });

    return NextResponse.json({ ok: true, orderId, payment });
  } catch (error) {
    console.error('NOWPayments direct checkout failed:', error);
    return NextResponse.json({
      ok: false,
      message: 'Cette fonctionnalité est actuellement en cours de développement.',
    }, { status: 400 });
  }
}
