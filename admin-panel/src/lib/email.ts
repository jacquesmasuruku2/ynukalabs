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
