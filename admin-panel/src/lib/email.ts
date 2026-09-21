import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || '587');
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM || 'Ynuka Labs <no-reply@ynukalabs.com>';

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
});

export async function sendAdminPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is missing');
  }

  return transporter.sendMail({
    from,
    to,
    subject: 'Réinitialisation de votre mot de passe admin Ynuka Labs',
    text: `Bonjour ${name},\n\nUtilisez ce lien pour définir un nouveau mot de passe admin : ${resetUrl}\n\nCe lien est valable pendant 1 heure et ne peut être utilisé qu'une seule fois.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><p>Bonjour ${name},</p><p>Utilisez ce lien pour définir un nouveau mot de passe admin :</p><p><a href="${resetUrl}" style="display:inline-block;background:#0B3B8B;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Réinitialiser le mot de passe</a></p><p>Ce lien est valable pendant 1 heure et ne peut être utilisé qu'une seule fois.</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p></div>`,
  });
}

export async function sendAdminInviteEmail({
  to,
  name,
  inviterName,
  inviteUrl,
}: {
  to: string;
  name?: string | null;
  inviterName: string;
  inviteUrl: string;
}) {
  if (!host || !user || !pass) throw new Error('SMTP configuration is missing');
  const displayName = (name || '').trim() || 'collègue';
  return transporter.sendMail({
    from,
    to,
    subject: 'Invitation admin Ynuka Labs — créez votre mot de passe',
    text: `Bonjour ${displayName},\n\n${inviterName} vous invite à rejoindre le panneau d'administration Ynuka Labs.\n\nCréez votre mot de passe via ce lien (valable 72 heures) :\n${inviteUrl}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f2847;padding:24px"><h1>Invitation administrateur</h1><p>Bonjour ${escapeHtml(displayName)},</p><p><strong>${escapeHtml(inviterName)}</strong> vous invite à rejoindre le panneau d'administration Ynuka Labs.</p><p><a href="${inviteUrl}" style="display:inline-block;background:#0B3B8B;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Créer mon mot de passe</a></p><p>Ce lien est valable 72 heures.</p></div>`,
  });
}

export async function sendEventSelectionEmail({
  to,
  name,
  eventTitle,
  exchangeUrl,
  customMessage,
}: {
  to: string;
  name: string;
  eventTitle: string;
  exchangeUrl: string;
  customMessage?: string;
}) {
  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is missing');
  }

  const intro =
    customMessage ||
    `Bonne nouvelle : vous avez été sélectionné(e) pour participer à « ${eventTitle} ».`;

  return transporter.sendMail({
    from,
    to,
    subject: `Sélectionné(e) — ${eventTitle} | Ynuka Labs`,
    text: `Bonjour ${name},\n\n${intro}\n\nOuvrez votre espace d'échange avec l'équipe : ${exchangeUrl}\n\nÀ bientôt,\nL'équipe Ynuka Labs`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f2847;background:#f7f8fa;padding:24px"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:28px"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#ffb800;font-weight:700">Ynuka Labs</p><h1 style="margin:0 0 16px;font-size:22px;color:#0f2847">Vous êtes sélectionné(e) !</h1><p>Bonjour ${name},</p><p>${intro}</p><p><a href="${exchangeUrl}" style="display:inline-block;background:#ffb800;color:#0f2847;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Ouvrir mon espace d'échange</a></p><p style="color:#64748b;font-size:14px">À bientôt,<br/>L'équipe Ynuka Labs</p></div></div>`,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendNewsletterConfirmationEmail({
  to,
  name,
  siteUrl,
}: {
  to: string;
  name?: string | null;
  siteUrl?: string;
}) {
  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is missing');
  }

  const displayName = (name || '').trim() || 'ami(e)';
  const safeName = escapeHtml(displayName);
  const base = (siteUrl || process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://ynukalabs.com').replace(/\/$/, '');

  return transporter.sendMail({
    from,
    to,
    subject: 'Bienvenue dans la newsletter Ynuka Labs',
    text: `Bonjour ${displayName},\n\nMerci de vous être abonné(e) à la newsletter Ynuka Labs.\nVous recevrez désormais nos actualités, événements, formations et opportunités.\n\nDécouvrir Ynuka Labs : ${base}\n\nÀ bientôt,\nL'équipe Ynuka Labs`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f2847;background:#f7f8fa;padding:24px"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:28px"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#ffb800;font-weight:700">Ynuka Labs</p><h1 style="margin:0 0 16px;font-size:22px;color:#0f2847">Abonnement confirmé</h1><p>Bonjour ${safeName},</p><p>Merci de vous être abonné(e) à la newsletter <strong>Ynuka Labs</strong>.</p><p>Vous recevrez désormais nos actualités, événements, formations et opportunités Web3.</p><p><a href="${base}" style="display:inline-block;background:#ffb800;color:#0f2847;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Visiter ynukalabs.com</a></p><p style="color:#64748b;font-size:14px">À bientôt,<br/>L'équipe Ynuka Labs</p></div></div>`,
  });
}
