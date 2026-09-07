import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return cors(response);
}

export async function GET() {
  try {
    console.log('Fetching authors from database...');
    const authors = await prisma.author.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    console.log('Authors fetched:', authors.length);
    return cors(NextResponse.json(authors));
  } catch (error) {
    console.error('Error fetching authors:', error);
    return cors(NextResponse.json({ 
      error: 'Failed to fetch authors',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const author = await prisma.author.create({
      data: {
        name: body.name,
        slug: body.slug,
        bio: body.bio,
        role: body.role,
        email: body.email,
        imageUrl: body.imageUrl,
        imageAlt: body.imageAlt,
      },
    });
    return cors(NextResponse.json(author, { status: 201 }));
  } catch (error) {
    console.error('Error creating author:', error);
    return cors(NextResponse.json({ 
      error: 'Failed to create author',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }));
  }
}
