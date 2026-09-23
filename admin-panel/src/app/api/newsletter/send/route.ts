import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePremiumAccess } from '@/lib/admin-session';
import { sendNewsletterEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { response: authResponse } = await requirePremiumAccess();
    if (authResponse) return authResponse;
    const body = await request.json();
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
    const html = typeof body?.html === 'string' ? body.html : '';
    const text = typeof body?.text === 'string' ? body.text : '';
    if (!subject || !html) return NextResponse.json({ error: 'Sujet et contenu requis.' }, { status: 400 });

    const includeEmails = Array.isArray(body?.includeEmails) ? body.includeEmails.filter((email: unknown): email is string => typeof email === 'string').map((email: string) => email.trim().toLowerCase()) : [];
    const excludeEmails = Array.isArray(body?.excludeEmails) ? body.excludeEmails.filter((email: unknown): email is string => typeof email === 'string').map((email: string) => email.trim().toLowerCase()) : [];
    const subscribers = await prisma.newsletterSubscription.findMany({
      where: {
        ...(body?.filter?.activeOnly !== false ? { isActive: true } : {}),
        ...(includeEmails.length ? { email: { in: includeEmails } } : {}),
        ...(excludeEmails.length ? { email: { notIn: excludeEmails } } : {}),
      },
      select: { email: true, name: true },
    });
    if (!subscribers.length) return NextResponse.json({ error: 'Aucun abonné correspondant.' }, { status: 400 });

    let count = 0;
    const failures: string[] = [];
    for (const subscriber of subscribers) {
      try {
        await sendNewsletterEmail({ to: subscriber.email, name: subscriber.name, subject, html, text });
        count += 1;
      } catch (error) {
        failures.push(subscriber.email);
        console.error('Newsletter delivery failed:', subscriber.email, error);
      }
    }
    return NextResponse.json({ success: failures.length === 0, count, total: subscribers.length, failures });
  } catch (error) {
    console.error('Admin newsletter send error:', error);
    return NextResponse.json({ error: 'Erreur lors de l’envoi de la newsletter.' }, { status: 500 });
  }
}
