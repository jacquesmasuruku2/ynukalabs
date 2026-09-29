import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-session';

type Activity = {
  id: string;
  type: 'contact' | 'partnership' | 'newsletter' | 'event-registration' | 'event-message' | 'event-proposal' | 'blog-comment';
  title: string;
  description: string;
  createdAt: string;
  href: string;
};

export async function GET() {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const [contacts, partnerships, subscribers, registrations, messages, proposals, comments, replies] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, name: true, subject: true, message: true, createdAt: true } }),
      prisma.partnership.findMany({ orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, companyName: true, contactName: true, type: true, createdAt: true } }),
      prisma.newsletterSubscription.findMany({ where: { isActive: true }, orderBy: { subscribedAt: 'desc' }, take: 12, select: { id: true, name: true, email: true, subscribedAt: true } }),
      prisma.eventRegistration.findMany({ orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, fullName: true, eventId: true, event: { select: { title: true, titleFr: true } }, createdAt: true } }),
      prisma.eventMessage.findMany({ where: { senderType: 'user' }, orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, senderName: true, body: true, createdAt: true, conversation: { select: { registration: { select: { id: true, eventId: true } } } } } }),
      prisma.eventProposal.findMany({ orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, title: true, contactName: true, createdAt: true } }),
      prisma.blogComment.findMany({ orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, authorName: true, content: true, articleId: true, article: { select: { title: true } }, createdAt: true } }),
      prisma.blogCommentReply.findMany({ orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, authorName: true, content: true, createdAt: true, comment: { select: { articleId: true, article: { select: { title: true } } } } } }),
    ]);

    const activities: Activity[] = [
      ...contacts.filter((item) => !/partenair|partner/i.test(item.subject || '')).map((item) => ({ id: `contact:${item.id}`, type: 'contact' as const, title: 'Nouveau message du site', description: `${item.name}${item.subject ? ` · ${item.subject}` : ''}: ${item.message.slice(0, 100)}`, createdAt: item.createdAt.toISOString(), href: '/form-submissions' })),
      ...partnerships.map((item) => ({ id: `partnership:${item.id}`, type: 'partnership' as const, title: 'Nouvelle demande de partenariat', description: `${item.companyName} · ${item.contactName} · ${item.type}`, createdAt: item.createdAt.toISOString(), href: '/form-submissions?tab=partnerships' })),
      ...subscribers.map((item) => ({ id: `newsletter:${item.id}`, type: 'newsletter' as const, title: 'Nouvelle inscription à la newsletter', description: item.name || item.email, createdAt: item.subscribedAt.toISOString(), href: '/newsletter' })),
      ...registrations.map((item) => ({ id: `registration:${item.id}`, type: 'event-registration' as const, title: 'Nouvelle inscription à un événement', description: `${item.fullName} · ${item.event.titleFr || item.event.title}`, createdAt: item.createdAt.toISOString(), href: '/events' })),
      ...messages.map((item) => ({ id: `event-message:${item.id}`, type: 'event-message' as const, title: 'Nouveau message d’un participant', description: `${item.senderName || 'Participant'}: ${item.body.slice(0, 100)}`, createdAt: item.createdAt.toISOString(), href: `/events?tab=registrations&registration=${encodeURIComponent(item.conversation.registration.id)}&eventId=${encodeURIComponent(item.conversation.registration.eventId)}` })),
      ...proposals.map((item) => ({ id: `proposal:${item.id}`, type: 'event-proposal' as const, title: 'Nouvelle proposition d’événement', description: `${item.title} · ${item.contactName}`, createdAt: item.createdAt.toISOString(), href: '/events?tab=proposals' })),
      ...comments.map((item) => ({ id: `comment:${item.id}`, type: 'blog-comment' as const, title: 'Nouveau commentaire sur le blog', description: `${item.authorName} sur « ${item.article.title} »: ${item.content.slice(0, 100)}`, createdAt: item.createdAt.toISOString(), href: `/articles/${item.articleId}/edit` })),
      ...replies.map((item) => ({ id: `comment-reply:${item.id}`, type: 'blog-comment' as const, title: 'Nouvelle réponse à un commentaire', description: `${item.authorName} sur « ${item.comment.article.title} »: ${item.content.slice(0, 100)}`, createdAt: item.createdAt.toISOString(), href: `/articles/${item.comment.articleId}/edit` })),
    ];

    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json({ adminId: session!.adminUserId, activities: activities.slice(0, 50) });
  } catch (error) {
    console.error('Admin activity feed error:', error);
    return NextResponse.json({ error: 'Impossible de charger les activités.' }, { status: 500 });
  }
}