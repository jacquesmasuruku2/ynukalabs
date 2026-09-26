import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { PREMIUM_PLAN_CONFIG, getPremiumPlan } from '@/lib/admin-premium';

type AtlosInvoiceResponse = {
  Id?: string;
  PaymentLink?: string;
  paymentLink?: string;
  error?: string;
  title?: string;
  type?: string;
  status?: number;
  errors?: Record<string, string[] | string>;
};

async function getAtlosErrorMessage(response: Response) {
  const rawText = await response.text();
  if (!rawText) {
    return `ATLOS request failed with status ${response.status}`;
  }

  try {
    const payload = JSON.parse(rawText) as AtlosInvoiceResponse & { errors?: Record<string, unknown> };
    const formattedErrors = payload.errors ? Object.entries(payload.errors)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
      .join(' | ') : '';

    return [
      payload.title || payload.error || 'ATLOS validation failed',
      formattedErrors || (payload.type ? `type=${payload.type}` : ''),
      `status=${payload.status ?? response.status}`,
    ].filter(Boolean).join(' — ');
  } catch {
    return `${response.status} ${rawText.slice(0, 500)}`;
  }
}

function getPremiumBaseUrl() {
  const configuredBaseUrl = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.ADMIN_PANEL_URL,
    process.env.PUBLIC_SITE_URL,
  ].find((value) => value && !/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value));

  return (configuredBaseUrl || 'https://admin.ynukalabs.com').replace(/\/$/, '');
}

function getPremiumSettingsUrl(query: string) {
  return new URL(`/settings?${query}`, getPremiumBaseUrl());
}

async function getAtlosCheckoutUrl(adminUserId: string, adminUserEmail: string, plan: string) {
  const merchantId = process.env.ATLOS_MERCHANT_ID || process.env.NEXT_PUBLIC_ATLOS_MERCHANT_ID;
  const apiSecret = process.env.ATLOS_API_SECRET;
  if (!merchantId || !apiSecret) return null;

  const apiUrl = (process.env.ATLOS_API_URL || 'https://api.atlos.io/gateway/rest').replace(/\/$/, '');
  const baseUrl = getPremiumBaseUrl();
  const premiumPlan = getPremiumPlan(plan);
  const config = PREMIUM_PLAN_CONFIG[premiumPlan];
  const orderId = `premium-${premiumPlan}-${adminUserId}-${Date.now()}`;

  const response = await fetch(`${apiUrl}/Invoice/Create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'MerchantId': merchantId,
      'X-Merchant-Id': merchantId,
      'ApiSecret': apiSecret,
    },
    body: JSON.stringify({
      MerchantId: merchantId,
      ApiSecret: apiSecret,
      OrderId: orderId,
      OrderAmount: config.price,
      OrderCurrency: 'USD',
      UserEmail: adminUserEmail,
      Memo: `Premium access - ${premiumPlan}`,
      PostbackUrl: `${baseUrl}/api/admin/premium/notify`,
    }),
  });

  if (!response.ok) {
    const errorText = await getAtlosErrorMessage(response);
    throw new Error(`ATLOS checkout failed: ${errorText}`);
  }

  const responseText = await response.text();
  if (!responseText) return null;

  const data = JSON.parse(responseText) as AtlosInvoiceResponse;
  return data.PaymentLink || data.paymentLink || null;
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
    const atlosCheckoutUrl = await getAtlosCheckoutUrl(session!.adminUser.id, session!.adminUser.email, plan);
    if (!atlosCheckoutUrl) {
      return NextResponse.redirect(getPremiumSettingsUrl('premium=unavailable'), 303);
    }

    return NextResponse.redirect(atlosCheckoutUrl);
  } catch (error) {
    console.error('Premium checkout init failed:', error);
    return NextResponse.redirect(getPremiumSettingsUrl('premium=unavailable'), 303);
  }
}
