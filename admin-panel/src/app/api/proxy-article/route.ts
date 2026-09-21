import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch the article content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();

    // Extract the main content (basic extraction for common article structures)
    // This is a simple extraction - you may need to adjust based on the specific site structure
    const contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/) ||
                       html.match(/<main[^>]*>([\s\S]*?)<\/main>/) ||
                       html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/);

    let content = contentMatch ? contentMatch[1] : html;

    // Clean up the HTML - remove scripts, styles, and unwanted elements
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/onclick="[^"]*"/gi, '')
      .replace(/onload="[^"]*"/gi, '');

    // Convert relative URLs to absolute
    const baseUrl = new URL(url);
    content = content.replace(
      /href="([^"]+)"/gi,
      (match, href) => {
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
          return match;
        }
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          return `href="${absoluteUrl}" target="_blank" rel="noopener noreferrer"`;
        } catch {
          return match;
        }
      }
    );

    content = content.replace(
      /src="([^"]+)"/gi,
      (match, src) => {
        if (src.startsWith('http') || src.startsWith('data:')) {
          return match;
        }
        try {
          const absoluteUrl = new URL(src, baseUrl).href;
          return `src="${absoluteUrl}"`;
        } catch {
          return match;
        }
      }
    );

    return NextResponse.json({
      content,
      originalUrl: url,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article content' },
      { status: 500 }
    );
  }
}
