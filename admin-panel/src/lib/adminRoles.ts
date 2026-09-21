function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const ADMIN_ROLE = {
  SUPER: 'super_admin',
  ADMIN: 'admin',
} as const;

export type AdminRole = (typeof ADMIN_ROLE)[keyof typeof ADMIN_ROLE];

export function getSuperAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS || process.env.ADMIN_SUPER_EMAIL || 'jacquesmasuruku2@gmail.com';
  return raw.split(/[,;\n]+/).map(normalizeEmail).filter(Boolean);
}

export function isSuperAdminEmail(email: string) {
  return getSuperAdminEmails().includes(normalizeEmail(email));
}

export function isSuperAdminRole(role?: string | null) {
  return role === ADMIN_ROLE.SUPER;
}

export function resolveAdminRole(email: string, currentRole?: string | null): AdminRole {
  if (isSuperAdminEmail(email) || currentRole === ADMIN_ROLE.SUPER) return ADMIN_ROLE.SUPER;
  return ADMIN_ROLE.ADMIN;
}