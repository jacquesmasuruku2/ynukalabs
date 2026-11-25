import { lookup } from 'dns/promises';
import net from 'net';

/** Plages d'adresses internes / réservées interdites (protection SSRF). */
function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith('::ffff:')) return isPrivateIp(v6.slice(7));
  return v6 === '::' || v6 === '::1' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
}

/**
 * Vérifie qu'une URL fournie par l'utilisateur pointe vers un serveur public en http(s).
 * Lève une erreur sinon.
 */
export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('URL invalide');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Seules les URL http(s) sont autorisées');
  if (url.username || url.password) throw new Error('URL invalide');
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('Port non autorisé');

  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
    throw new Error('Hôte non autorisé');
  }
  const addresses = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) {
    throw new Error('Hôte non autorisé');
  }
  return url;
}
