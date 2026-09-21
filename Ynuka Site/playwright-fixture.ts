import { test as base, expect } from '@playwright/test';

/**
 * Fixtures de test personnalisés par Jacques MASURUKU
 * 
 * Extensions des fixtures Playwright de base pour les besoins spécifiques
 * du projet GOMA HUB WEB3
 */
export const test = base.extend({
  // Ajouter ici des fixtures personnalisées si nécessaire
  // Exemple: page étendue avec utilitaires spécifiques
});

export { expect };
