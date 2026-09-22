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

export async function sendAdminLoginAlertEmail({
  to,
  adminName,
  adminEmail,
  loginAt,
  ipAddress,
  device,
  userAgent,
  location,
}: {
  to: string;
  adminName: string;
  adminEmail: string;
  loginAt: Date;
  ipAddress: string;
  device: string;
  userAgent: string;
  location: string;
}) {
  if (!host || !user || !pass) throw new Error('SMTP configuration is missing');
  const date = loginAt.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Etc/GMT-2' });
  const safe = (value: string) => escapeHtml(value || 'Inconnu');
  return transporter.sendMail({
    from,
    to,
    subject: 'Alerte de sécurité — nouvelle connexion au panel Ynuka Labs',
    text: `Bonjour ${adminName},\n\nUne connexion vient d'être effectuée sur le panel d'administration Ynuka Labs.\n\nCompte : ${adminEmail}\nDate et heure (UTC+2) : ${date}\nAdresse IP : ${ipAddress}\nLocalisation : ${location}\nAppareil : ${device}\nNavigateur : ${userAgent}\n\nSi cette connexion ne vient pas de vous, changez immédiatement votre mot de passe et contactez l'équipe Ynuka Labs.`,
    html: `<div style="margin:0;background:#f3f6fa;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14213d"><div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #dfe6ef;border-radius:14px;overflow:hidden"><div style="height:6px;background:#ffb800"></div><div style="padding:30px"><p style="margin:0 0 18px;color:#0b3b8b;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Ynuka Labs</p><h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#102a43">Nouvelle connexion détectée</h1><p style="font-size:16px;line-height:1.6">Bonjour ${safe(adminName)},</p><p style="font-size:15px;line-height:1.6">Une connexion vient d'être effectuée sur le panel d'administration.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;border-collapse:collapse;font-size:14px"><tr><td style="padding:10px 0;color:#65758b;width:38%">Compte</td><td style="padding:10px 0;font-weight:700">${safe(adminEmail)}</td></tr><tr><td style="padding:10px 0;color:#65758b;border-top:1px solid #edf1f5">Date et heure (UTC+2)</td><td style="padding:10px 0;border-top:1px solid #edf1f5">${safe(date)}</td></tr><tr><td style="padding:10px 0;color:#65758b;border-top:1px solid #edf1f5">Adresse IP</td><td style="padding:10px 0;border-top:1px solid #edf1f5">${safe(ipAddress)}</td></tr><tr><td style="padding:10px 0;color:#65758b;border-top:1px solid #edf1f5">Localisation</td><td style="padding:10px 0;border-top:1px solid #edf1f5">${safe(location)}</td></tr><tr><td style="padding:10px 0;color:#65758b;border-top:1px solid #edf1f5">Appareil</td><td style="padding:10px 0;border-top:1px solid #edf1f5">${safe(device)}</td></tr><tr><td style="padding:10px 0;color:#65758b;border-top:1px solid #edf1f5">Navigateur</td><td style="padding:10px 0;border-top:1px solid #edf1f5;word-break:break-word">${safe(userAgent)}</td></tr></table><p style="margin:0;padding:14px 16px;border-left:4px solid #e56a6a;background:#fff3f3;color:#6b2b2b;font-size:14px;line-height:1.6">Si cette connexion ne vient pas de vous, changez immédiatement votre mot de passe et contactez l'équipe Ynuka Labs.</p></div></div></div>`,
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
  const safeInviter = escapeHtml(inviterName.trim() || 'Jacques Masuruku');
  const safeInviteUrl = escapeHtml(inviteUrl);
  return transporter.sendMail({
    from,
    to,
    subject: 'Invitation admin Ynuka Labs — créez votre mot de passe',
    text: `Bonjour ${displayName},\n\n${inviterName} vous invite à rejoindre le panneau d'administration du site web de Ynuka Labs.\n\nCliquez sur ce lien pour définir votre mot de passe sécurisé :\n${inviteUrl}\n\nCe lien est valable pendant 3 jours (72 heures).\n\nSi cette invitation ne vous concerne pas, ignorez simplement ce message.\n\nÀ bientôt,\nL'équipe Ynuka Labs`,
    html: `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation administrateur Ynuka Labs</title>
    <style>
      @media screen and (max-width: 600px) {
        .email-shell { width: 100% !important; }
        .email-card { border-radius: 0 !important; }
        .email-padding { padding: 28px 20px !important; }
        .button { display: block !important; text-align: center !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#f3f6fa;font-family:Arial,Helvetica,sans-serif;color:#14213d;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Définissez votre mot de passe sécurisé pour rejoindre le panneau d'administration Ynuka Labs.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f6fa;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" class="email-shell" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
            <tr>
              <td class="email-card" style="background:#ffffff;border:1px solid #dfe6ef;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,40,71,.08);">
                <div style="height:6px;background:#ffb800;"></div>
                <div class="email-padding" style="padding:34px 36px;">
                  <p style="margin:0 0 22px;color:#0b3b8b;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Ynuka Labs</p>
                  <h1 style="margin:0 0 18px;color:#102a43;font-size:28px;line-height:1.2;font-weight:700;">Invitation à rejoindre l'administration</h1>
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Bonjour ${escapeHtml(displayName)},</p>
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.7;"><strong>${safeInviter}</strong> vous invite à rejoindre le panneau d'administration du site web de Ynuka Labs.</p>
                  <p style="margin:0 0 26px;font-size:16px;line-height:1.7;">Cliquez sur le bouton ci-dessous pour définir votre mot de passe sécurisé.</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">
                    <tr>
                      <td style="border-radius:9px;background:#0b3b8b;">
                        <a class="button" href="${safeInviteUrl}" style="display:inline-block;padding:15px 24px;border:1px solid #0b3b8b;border-radius:9px;background:#0b3b8b;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">Définir mon mot de passe</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 18px;padding:14px 16px;border-left:4px solid #ffb800;background:#fff8df;color:#3c4858;font-size:14px;line-height:1.6;"><strong>À savoir :</strong> ce lien est valable pendant 3 jours (72 heures).</p>
                  <p style="margin:0 0 24px;color:#65758b;font-size:14px;line-height:1.6;">Si cette invitation ne vous concerne pas, ignorez simplement ce message.</p>
                  <p style="margin:0;color:#65758b;font-size:14px;line-height:1.6;">À bientôt,<br><strong style="color:#102a43;">L'équipe Ynuka Labs</strong></p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 12px;text-align:center;color:#8291a5;font-size:12px;line-height:1.5;">
                Si le bouton ne fonctionne pas, ouvrez ce lien :<br>
                <a href="${safeInviteUrl}" style="color:#0b3b8b;word-break:break-all;">${safeInviteUrl}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
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
