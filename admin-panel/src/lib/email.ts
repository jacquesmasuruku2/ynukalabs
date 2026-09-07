import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || '587');
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM || 'Malakinfo <no-reply@malakinfo.com>';

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
    subject: 'Réinitialisation de votre mot de passe admin MalakInfo',
    text: `Bonjour ${name},\n\nUtilisez ce lien pour définir un nouveau mot de passe admin : ${resetUrl}\n\nCe lien est valable pendant 1 heure et ne peut être utilisé qu'une seule fois.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><p>Bonjour ${name},</p><p>Utilisez ce lien pour définir un nouveau mot de passe admin :</p><p><a href="${resetUrl}" style="display:inline-block;background:#0B3B8B;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Réinitialiser le mot de passe</a></p><p>Ce lien est valable pendant 1 heure et ne peut être utilisé qu'une seule fois.</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p></div>`,
  });
}
