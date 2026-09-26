import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPremiumExpiryDate, getPremiumPlan } from '@/lib/admin-premium';

function normalizeStatus(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody || '{}');

    if (payload.MerchantId || payload.Status !== undefined) {
      const merchantId = process.env.ATLOS_MERCHANT_ID || process.env.NEXT_PUBLIC_ATLOS_MERCHANT_ID;
      const apiSecret = process.env.ATLOS_API_SECRET;
      const signature = request.headers.get('Signature');
      if (!merchantId || !apiSecret || !signature || payload.MerchantId !== merchantId) {
        return NextResponse.json({ ok: false, message: 'Invalid payment callback.' }, { status: 401 });
      }

      const expectedSignature = crypto.createHmac('sha256', apiSecret).update(rawBody).digest('base64');
      const received = Buffer.from(signature);
      const expected = Buffer.from(expectedSignature);
      if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
        return NextResponse.json({ ok: false, message: 'Invalid payment callback.' }, { status: 401 });
      }

      const rawOrderId = String(payload.OrderId ?? '').trim();
      const match = rawOrderId.match(/^premium-(monthly|annual)-([a-zA-Z0-9]+)-/);
      if (!match || Number(payload.Status) !== 100) {
        return NextResponse.json({ ok: true, message: 'ATLOS payment ignored.' });
      }

      const plan = getPremiumPlan(match[1]);
      await prisma.adminUser.update({
        where: { id: match[2] },
        data: {
          isPremium: true,
          premiumPlan: plan,
          premiumStartedAt: new Date(),
          premiumExpiresAt: getPremiumExpiryDate(plan),
        },
      });
      return NextResponse.json({ ok: true, message: 'ATLOS Premium payment accepted.' });
    }

    const rawOrderId = String(payload.order_id ?? payload.orderId ?? payload.id ?? '').trim();
    const status = normalizeStatus(payload.payment_status ?? payload.status ?? payload.state ?? payload.event);
    const isSuccessfulPayment = ['finished', 'paid', 'success', 'succeeded', 'confirmed'].includes(status);

    console.info('Legacy premium callback received:', JSON.stringify({ rawOrderId, status }));

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
    console.error('Premium callback failed:', error);
    return NextResponse.json({ ok: false, message: 'Callback processing failed.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Premium callback endpoint ready.' });
}
