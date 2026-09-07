import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, imageUrl, websiteUrl } = body;

    if (websiteUrl) {
      try {
        const parsedWebsiteUrl = new URL(websiteUrl);
        if (!['http:', 'https:'].includes(parsedWebsiteUrl.protocol)) throw new Error('Invalid protocol');
      } catch {
        return NextResponse.json(
          { error: 'Website URL must be a valid HTTP or HTTPS URL' },
          { status: 400 }
        );
      }
    }

    if (!status && imageUrl === undefined && websiteUrl === undefined) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const partnership = await prisma.partnership.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        ...(websiteUrl !== undefined ? { websiteUrl: websiteUrl || null } : {}),
      },
    });

    return NextResponse.json(partnership);
  } catch (error) {
    console.error('Error updating partnership:', error);
    return NextResponse.json(
      { error: 'Failed to update partnership' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.partnership.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Partnership deleted successfully' });
  } catch (error) {
    console.error('Error deleting partnership:', error);
    return NextResponse.json(
      { error: 'Failed to delete partnership' },
      { status: 500 }
    );
  }
}
