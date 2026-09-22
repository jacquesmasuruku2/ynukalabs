import { NextRequest } from 'next/server';

export type AdminLoginContext = {
  ipAddress: string;
  userAgent: string;
  device: string;
  location: string;
};

export type AdminLoginCoordinates = { latitude: number; longitude: number };

function isPrivateIp(ipAddress: string) {
  return ipAddress === '127.0.0.1' || ipAddress === '::1' || /^10\./.test(ipAddress) || /^192\.168\./.test(ipAddress) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ipAddress);
}

async function resolveIpLocation(request: NextRequest, ipAddress: string) {
  const forwardedCity = request.headers.get('x-vercel-ip-city') || request.headers.get('x-appengine-city');
  if (forwardedCity) return decodeURIComponent(forwardedCity);
  if (!ipAddress || ipAddress === 'Inconnue' || isPrivateIp(ipAddress)) return 'Localisation indisponible';

  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ipAddress)}/json/`, { signal: AbortSignal.timeout(1500), cache: 'no-store' });
    if (!response.ok) return 'Localisation indisponible';
    const data = await response.json() as { city?: string; country_name?: string };
    return [data.city, data.country_name].filter(Boolean).join(', ') || 'Localisation indisponible';
  } catch {
    return 'Localisation indisponible';
  }
}

async function resolveBrowserLocation(coordinates: AdminLoginCoordinates) {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&localityLanguage=fr`, { signal: AbortSignal.timeout(2000), cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json() as { city?: string; locality?: string; principalSubdivision?: string; countryName?: string };
    const city = data.city || data.locality;
    return [city, data.principalSubdivision, data.countryName].filter(Boolean).join(', ') || null;
  } catch {
    return null;
  }
}

export async function getAdminLoginContext(request: NextRequest, coordinates?: AdminLoginCoordinates): Promise<AdminLoginContext> {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'Inconnue';
  const userAgent = request.headers.get('user-agent') || 'Navigateur inconnu';
  const device = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Téléphone ou tablette' : /tablet/i.test(userAgent) ? 'Tablette' : 'Ordinateur';
  const browserLocation = coordinates && Number.isFinite(coordinates.latitude) && Number.isFinite(coordinates.longitude) && Math.abs(coordinates.latitude) <= 90 && Math.abs(coordinates.longitude) <= 180
    ? await resolveBrowserLocation(coordinates)
    : null;
  return { ipAddress: ipAddress.slice(0, 100), userAgent: userAgent.slice(0, 500), device, location: browserLocation || await resolveIpLocation(request, ipAddress) };
}