import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const checkoutUrl = process.env.STRIPE_CHECKOUT_URL || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL;
  if (!checkoutUrl) {
    return NextResponse.json(
      { error: 'Le lien de paiement Premium n’est pas encore configuré.' },
      { status: 503 },
    );
  }

  return NextResponse.redirect(checkoutUrl);
}
