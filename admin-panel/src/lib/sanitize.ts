'use client';

import DOMPurify from 'dompurify';

/**
 * Nettoie du HTML (articles importés depuis un site externe, contenus riches)
 * avant de l'afficher avec dangerouslySetInnerHTML : protection XSS.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'], FORBID_TAGS: ['style', 'form', 'input'] });
}
