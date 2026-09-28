import { createHash } from 'node:crypto';

const AVATAR_COLORS = ['#0f766e', '#0369a1', '#b45309', '#be123c', '#4d7c0f', '#475569'];

export function createCommentAvatar(email: string) {
  const digest = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  const color = AVATAR_COLORS[parseInt(digest.slice(0, 2), 16) % AVATAR_COLORS.length];
  const cells: string[] = [];

  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const bit = parseInt(digest[(row * 3 + column + 2) % digest.length], 16) & 1;
      if (!bit) continue;

      const y = 7 + row * 10;
      cells.push(`<rect x="${7 + column * 10}" y="${y}" width="8" height="8" rx="2"/>`);
      if (column < 2) {
        cells.push(`<rect x="${7 + (4 - column) * 10}" y="${y}" width="8" height="8" rx="2"/>`);
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#e2e8f0"/><g fill="${color}">${cells.join('')}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}