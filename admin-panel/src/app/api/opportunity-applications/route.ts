import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { corsOptions, jsonCors } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptions();
}

/** Public application / motivation submission from the main site */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const opportunityId = body.opportunityId || body.opportunity_id;
    if (!opportunityId || !body.userEmail && !body.email) {
      return jsonCors({ error: 'opportunityId and email required' }, { status: 400 });
    }

    if (body.type === 'motivation' || body.message || body.cvFileUrl || body.cv_file_url) {
      const form = await prisma.opportunityMotivationForm.create({
        data: {
          opportunityId,
          userEmail: body.userEmail || body.email,
          userName: body.userName || body.name || null,
          userAvatar: body.userAvatar || null,
          linkedinUrl: body.linkedinUrl || body.linkedin_url || null,
          twitterUrl: body.twitterUrl || body.twitter_url || null,
          portfolioUrl: body.portfolioUrl || body.portfolio_url || null,
          message: body.message || null,
          cvFileUrl: body.cvFileUrl || body.cv_file_url || null,
        },
      });
      return jsonCors(form, { status: 201 });
    }

    const application = await prisma.opportunityApplication.create({
      data: {
        opportunityId,
        userEmail: body.userEmail || body.email,
        userName: body.userName || body.name || null,
        userAvatar: body.userAvatar || null,
        status: 'pending',
      },
    });
    return jsonCors(application, { status: 201 });
  } catch (error) {
    return jsonCors(
      { error: 'Failed to submit application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
