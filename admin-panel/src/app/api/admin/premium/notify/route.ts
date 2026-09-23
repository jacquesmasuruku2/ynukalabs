import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    console.info('NOWPayments premium callback received:', JSON.stringify(payload));
    return NextResponse.json({ ok: true, message: 'Premium payment callback accepted.' });
  } catch (error) {
    console.error('NOWPayments premium callback failed:', error);
    return NextResponse.json({ ok: false, message: 'Callback processing failed.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Premium callback endpoint ready.' });
}
