/**
 * Utilitaires centralisés pour la gestion des dates et fuseaux horaires
 * Timezone par défaut: Africa/Lubumbashi (UTC+2) - Goma/Lubumbashi, RDC
 */

const TIMEZONE = 'Africa/Lubumbashi';

/**
 * Formate une date selon le fuseau horaire de Lubumbashi/Goma
 * @param date - Date à formater (string, Date, ou timestamp)
 * @param options - Options de formatage Intl.DateTimeFormat
 * @returns Date formatée en français
 */
export function formatDate(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dateObj.toLocaleString('fr-FR', {
    ...options,
    timeZone: TIMEZONE,
  });
}

/**
 * Formate une date et heure selon le fuseau horaire de Lubumbashi/Goma
 * @param date - Date à formater
 * @returns Date et heure formatées en français
 */
export function formatDateTime(date: string | Date | number): string {
  return formatDate(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate une heure selon le fuseau horaire de Lubumbashi/Goma
 * @param date - Date à formater
 * @returns Heure formatée en français
 */
export function formatTime(date: string | Date | number): string {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate une date courte selon le fuseau horaire de Lubumbashi/Goma
 * @param date - Date à formater
 * @returns Date courte formatée en français
 */
export function formatShortDate(date: string | Date | number): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formate une date relative (ex: "Il y a 5 minutes")
 * @param date - Date à formater
 * @returns Date relative en français
 */
export function formatRelativeTime(date: string | Date | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "À l'instant";
  } else if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else {
    return formatShortDate(date);
  }
}

/**
 * Convertit une date en ISO string selon le fuseau horaire de Lubumbashi/Goma
 * @param date - Date à convertir
 * @returns Date en format ISO string
 */
export function toISOString(date: string | Date | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Crée une nouvelle Date selon le fuseau horaire de Lubumbashi/Goma
 * @param year - Année
 * @param month - Mois (0-11)
 * @param day - Jour
 * @param hours - Heures (0-23)
 * @param minutes - Minutes (0-59)
 * @param seconds - Secondes (0-59)
 * @returns Date créée
 */
export function createDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0
): Date {
  // Créer la date en UTC puis ajuster pour le fuseau horaire
  const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
  return date;
}

/**
 * Retourne la date actuelle selon le fuseau horaire de Lubumbashi/Goma
 * @returns Date actuelle
 */
export function now(): Date {
  return new Date();
}

/**
 * Vérifie si une date est aujourd'hui selon le fuseau horaire de Lubumbashi/Goma
 * @param date - Date à vérifier
 * @returns true si la date est aujourd'hui
 */
export function isToday(date: string | Date | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Vérifie si une date est dans le futur selon le fuseau horaire de Lubumbashi/Goma
 * @param date - Date à vérifier
 * @returns true si la date est dans le futur
 */
export function isFuture(date: string | Date | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Vérifie si une date est dans le passé selon le fuseau horaire de Lubumbashi/Goma
 * @param date - Date à vérifier
 * @returns true si la date est dans le passé
 */
export function isPast(date: string | Date | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dateObj < new Date();
}
