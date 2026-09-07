import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL;
  if (!mainSiteUrl) {
    return NextResponse.json({ error: 'MAIN site URL non configurée' }, { status: 500 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${mainSiteUrl}/api/newsletter/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? JSON.parse(responseText)
      : { message: responseText };

    if (!response.ok) {
      console.error('Admin newsletter proxy error: upstream response failed', {
        status: response.status,
        statusText: response.statusText,
        body: data,
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin newsletter proxy error:');
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    return NextResponse.json(
      { error: 'Erreur lors de l’envoi à l’API principale' },
      { status: 500 }
    );
  }
}
