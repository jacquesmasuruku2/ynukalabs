import crypto from 'node:crypto';

export type NowPaymentsPlanInterval = 'day' | 'week' | 'month' | 'year';

function getBaseUrl() {
  return (process.env.NOWPAYMENTS_API_BASE_URL || process.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1').replace(/\/$/, '');
}

function getApiKey() {
  return process.env.NOWPAYMENTS_API_KEY;
}

function getIpnSecret() {
  return process.env.NOWPAYMENTS_IPN_SECRET;
}

export async function nowpaymentsRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('NOWPAYMENTS_API_KEY is not configured.');
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...(init.headers || {}),
    },
  });

  const rawText = await response.text();
  if (!response.ok) {
    let message = rawText || `NOWPayments request failed (${response.status})`;
    try {
      const parsed = JSON.parse(rawText) as { message?: string; error?: string; errors?: Record<string, unknown> };
      message = parsed.message || parsed.error || JSON.stringify(parsed.errors || parsed);
    } catch {
      // Keep the raw text when JSON parsing fails.
    }
    throw new Error(`NOWPayments API error: ${message}`);
  }

  if (!rawText) {
    return {} as T;
  }

  return JSON.parse(rawText) as T;
}

export async function createNowPaymentsPayment(input: {
  amount: number;
  currency?: string;
  payCurrency?: string;
  orderId: string;
  description: string;
  callbackUrl: string;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const payload = {
    price_amount: Number(input.amount),
    price_currency: (input.currency || 'usd').toLowerCase(),
    pay_currency: (input.payCurrency || 'ada').toLowerCase(),
    order_id: input.orderId,
    order_description: input.description,
    ipn_callback_url: input.callbackUrl,
    success_url: input.successUrl || input.callbackUrl,
    cancel_url: input.cancelUrl || input.callbackUrl,
  };

  return nowpaymentsRequest<{ payment_id?: string; payment_status?: string; pay_address?: string; pay_amount?: number; pay_currency?: string; payment_url?: string; invoice_url?: string; id?: string; url?: string; }>(`/payment`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createNowPaymentsSubscriptionPlan(input: {
  name: string;
  amount: number;
  currency?: string;
  interval: NowPaymentsPlanInterval;
  intervalCount?: number;
  description?: string;
}) {
  const payload = {
    name: input.name,
    amount: Number(input.amount),
    currency: (input.currency || 'usd').toUpperCase(),
    interval: input.interval,
    interval_count: input.intervalCount || 1,
    description: input.description || '',
  };

  return nowpaymentsRequest<{ id?: string; name?: string; amount?: number; currency?: string; interval?: string; interval_count?: number }>(`/subscriptions/plans`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyNowPaymentsWebhook(rawBody: string, headers: Headers) {
  const secret = getIpnSecret();
  if (!secret) {
    return { valid: false, reason: 'NOWPAYMENTS_IPN_SECRET is not configured.' };
  }

  const signatureHeader = headers.get('x-nowpayments-sig') || headers.get('x-nowpayments-signature') || headers.get('x-signature');
  if (!signatureHeader) {
    return { valid: false, reason: 'Missing NOWPayments signature header.' };
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signatureHeader.trim();
  const normalizedProvided = provided.toLowerCase();
  const normalizedExpected = expected.toLowerCase();

  if (normalizedProvided !== normalizedExpected) {
    return { valid: false, reason: 'Invalid NOWPayments signature.' };
  }

  return { valid: true, reason: null };
}
