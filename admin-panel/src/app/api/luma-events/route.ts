import { NextRequest } from 'next/server';
import { corsOptions, jsonCors } from '@/lib/cors';

const LUMA_CALENDAR_ID = process.env.LUMA_CALENDAR_ID || 'cal-wd1NdDJfLuRoIBV';

function normalizeLocation(event: any) {
  const city = event?.geo_address_info?.city || event?.geo_address_info?.full_address;
  if (city?.trim()) return city.trim();
  if (event?.location_type === 'meet' || event?.location_type === 'online') return 'Online';
  return 'Luma';
}

function mapEvent(entry: any) {
  const event = entry?.event;
  if (!event?.api_id || !event?.name || !event?.start_at) return null;

  const slug = typeof event.url === 'string' ? event.url.trim() : '';
  return {
    id: event.api_id,
    title: event.name,
    description: event.description || event.name,
    startAt: event.start_at,
    endAt: event.end_at || null,
    timezone: event.timezone || null,
    coverUrl: event.cover_url || null,
    url: slug ? `https://luma.com/${slug.replace(/^https?:\/\//i, '').replace(/^www\./i, '')}` : `https://luma.com/event/${event.api_id}`,
    locationLabel: normalizeLocation(event),
    locationType: event.location_type || null,
  };
}

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit') || 50), 1), 50);
    const qs = new URLSearchParams({
      calendar_api_id: LUMA_CALENDAR_ID,
      pagination_limit: String(limit),
      period: 'future',
    });

    const response = await fetch(`https://api.luma.com/calendar/get-items?${qs.toString()}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'YnukaLabs-Admin/1.0',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return jsonCors([], { status: response.status >= 400 ? 200 : response.status });
    }

    const payload = await response.json().catch(() => null);
    const entries = Array.isArray(payload?.entries) ? payload.entries : [];
    const mapped = entries.map(mapEvent).filter(Boolean);

    return jsonCors(mapped);
  } catch (error) {
    console.error('Luma events proxy error:', error);
    return jsonCors([], { status: 200 });
  }
}
