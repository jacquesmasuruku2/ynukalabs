import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPremiumExpiryDate, getPremiumPlan } from '@/lib/admin-premium';
import { verifyNowPaymentsWebhook } from '@/lib/nowpayments';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verification = verifyNowPaymentsWebhook(rawBody, request.headers);

  if (!verification.valid) {
    console.error('NOWPayments webhook rejected:', verification.reason);
    return NextResponse.json({ ok: false, message: verification.reason }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody || '{}') as {
      payment_id?: string;
      payment_status?: string;
      status?: string;
      id?: string;
      order_id?: string;
      orderId?: string;
      pay_currency?: string;
      price_amount?: number;
      price_currency?: string;
    };

    const paymentStatus = String(payload.payment_status ?? payload.status ?? '').toLowerCase();
    const rawOrderId = String(payload.order_id ?? payload.orderId ?? '').trim();
    const isAcceptedStatus = ['finished', 'paid', 'confirmed', 'processed', 'success'].includes(paymentStatus);

    if (!rawOrderId || !isAcceptedStatus) {
      return NextResponse.json({ ok: true, message: 'NOWPayments webhook ignored.' });
    }

    const match = rawOrderId.match(/^nowpayments-(monthly|annual)-([a-zA-Z0-9]+)-/);
    if (!match) {
      return NextResponse.json({ ok: true, message: 'NOWPayments order ignored; not a premium payment.' });
    }

    const premiumPlan = getPremiumPlan(match[1]);
    const userId = match[2];
    const startedAt = new Date();
    const expiresAt = getPremiumExpiryDate(premiumPlan, startedAt);

    await prisma.adminUser.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumPlan: premiumPlan,
        premiumStartedAt: startedAt,
        premiumExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({ ok: true, message: 'NOWPayments premium activation succeeded.' });
  } catch (error) {
    console.error('NOWPayments webhook failed:', error);
    return NextResponse.json({ ok: false, message: 'Webhook processing failed.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'NOWPayments webhook endpoint ready.' });
}
