import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPremiumExpiryDate, getPremiumPlan } from '@/lib/admin-premium';

function normalizeStatus(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    const rawOrderId = String(payload.order_id ?? payload.orderId ?? payload.id ?? '').trim();
    const status = normalizeStatus(payload.payment_status ?? payload.status ?? payload.state ?? payload.event);
    const isSuccessfulPayment = ['finished', 'paid', 'success', 'succeeded', 'confirmed'].includes(status);

    console.info('NOWPayments premium callback received:', JSON.stringify({ rawOrderId, status }));

    if (!rawOrderId) {
      return NextResponse.json({ ok: false, message: 'Missing order_id' }, { status: 400 });
    }

    const match = rawOrderId.match(/^premium-(monthly|annual)-([a-zA-Z0-9]+)-/);
    if (!match) {
      return NextResponse.json({ ok: true, message: 'Order ignored; not a premium payment.' });
    }

    const plan = getPremiumPlan(match[1]);
    const userId = match[2];
    const startedAt = new Date();
    const expiresAt = getPremiumExpiryDate(plan, startedAt);

    if (isSuccessfulPayment) {
      await prisma.adminUser.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumPlan: plan,
          premiumStartedAt: startedAt,
          premiumExpiresAt: expiresAt,
        },
      });
    }

    return NextResponse.json({ ok: true, message: 'Premium payment callback accepted.' });
  } catch (error) {
    console.error('NOWPayments premium callback failed:', error);
    return NextResponse.json({ ok: false, message: 'Callback processing failed.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Premium callback endpoint ready.' });
}
