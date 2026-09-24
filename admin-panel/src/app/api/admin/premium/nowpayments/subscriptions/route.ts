import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { createNowPaymentsSubscriptionPlan } from '@/lib/nowpayments';
import { prisma } from '@/lib/prisma';
import { getPremiumExpiryDate, getPremiumPlan } from '@/lib/admin-premium';

export async function POST(request: Request) {
  const { response, session } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const planName = String(body?.name || 'Ynuka Labs Premium');
    const planKey = String(body?.plan || 'monthly');
    const premiumPlan = getPremiumPlan(planKey);
    const amount = Number(body?.amount ?? 5);
    const currency = String(body?.currency || 'usd');
    const interval = String(body?.interval || 'month');
    const intervalCount = Number(body?.interval_count || 1);

    const plan = await createNowPaymentsSubscriptionPlan({
      name: planName,
      amount,
      currency,
      interval: interval === 'year' ? 'year' : 'month',
      intervalCount: intervalCount,
      description: `Premium plan ${premiumPlan}`,
    });

    const startedAt = new Date();
    const expiresAt = getPremiumExpiryDate(premiumPlan, startedAt);

    await prisma.adminUser.update({
      where: { id: session!.adminUser.id },
      data: {
        isPremium: true,
        premiumPlan: premiumPlan,
        premiumStartedAt: startedAt,
        premiumExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      plan,
      premium: {
        plan: premiumPlan,
        startedAt: startedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('NOWPayments subscription creation failed:', error);
    return NextResponse.json({
      ok: false,
      message: 'Cette fonctionnalité est actuellement en cours de développement.',
    }, { status: 400 });
  }
}
