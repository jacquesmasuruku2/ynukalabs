export type NewsletterArticle = {
  id: string;
  title: string;
  excerpt?: string | null;
  slug?: string | null;
  mainImageUrl?: string | null;
  publishedAt?: string | Date | null;
  category?: {
    title?: string | null;
    slug?: string | null;
  } | null;
};

const escapeHtml = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const normalizeText = (value: string | null | undefined, maxLength = 200) => {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

const buildArticleUrl = (article: NewsletterArticle) => {
  const baseUrl = 'https://malakinfo.com';
  const locale = 'fr';
  const slug = article.slug || '';

  if (!slug) {
    return `${baseUrl.replace(/\/$/, '')}`;
  }

  return `${baseUrl.replace(/\/$/, '')}/${locale}/${slug}`;
};

const responsiveNewsletterCss = `
  <style>
    @media only screen and (max-width: 620px) {
      .newsletter-shell { width: 100% !important; }
      .newsletter-content { width: 100% !important; }
      .newsletter-mobile-padding { padding-left: 12px !important; padding-right: 12px !important; }
      .newsletter-hero-image {
        width: 100% !important;
        max-width: 100% !important;
        height: 260px !important;
        min-height: 260px !important;
        object-fit: cover !important;
        display: block !important;
      }
      .newsletter-card-image {
        width: 100% !important;
        max-width: 100% !important;
        height: 220px !important;
        object-fit: cover !important;
        float: none !important;
        display: block !important;
        margin: 0 0 10px 0 !important;
        border-radius: 10px !important;
      }
      .newsletter-stack {
        width: 100% !important;
        display: block !important;
      }
      .newsletter-stack-cell {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
      }
      .newsletter-stack-cell img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
      }
      .newsletter-secondary-row {
        display: block !important;
        width: 100% !important;
      }
      .newsletter-secondary-image-cell {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 0 10px 0 !important;
      }
      .newsletter-secondary-text-cell {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding-top: 0 !important;
      }
      .newsletter-secondary-image {
        width: 100% !important;
        max-width: 100% !important;
        height: 220px !important;
        min-height: 220px !important;
        object-fit: cover !important;
        display: block !important;
        margin: 0 !important;
      }
      .newsletter-button-cell { display: block !important; width: 100% !important; }
      .newsletter-button-link { display: block !important; width: auto !important; text-align: center !important; }
      .newsletter-social-cell { 
        display: inline-block !important; 
        padding: 6px 8px !important; 
        width: auto !important;
        vertical-align: top !important;
      }
      .newsletter-social-link {
        display: inline-block !important;
        width: auto !important;
        height: auto !important;
        text-align: center !important;
        text-decoration: none !important;
      }
      .newsletter-social-icon {
        display: inline-block !important;
        width: 36px !important;
        height: 36px !important;
        margin: 0 auto 6px auto !important;
        border-radius: 50% !important;
        background-color: inherit !important;
        text-align: center !important;
        line-height: 36px !important;
      }
      .newsletter-social-icon img {
        width: 20px !important;
        height: 20px !important;
        display: inline-block !important;
        vertical-align: middle !important;
      }
      .newsletter-social-label {
        display: block !important;
        font-family: Arial, sans-serif !important;
        font-size: 10px !important;
        line-height: 14px !important;
        color: #0f172a !important;
        text-align: center !important;
      }
      .newsletter-title { font-size: 24px !important; line-height: 30px !important; }
      .newsletter-subtitle { font-size: 18px !important; line-height: 24px !important; }
      .newsletter-text-content { overflow: hidden !important; display: block !important; }
      .newsletter-secondary-row td { padding-bottom: 8px !important; }
    }
  </style>
`;

export function generateMalakinfoNewsletterHtml(articles: NewsletterArticle[]) {
  if (!articles || articles.length === 0) {
    return '<p>Pas d’articles sélectionnés.</p>';
  }

  const orderedArticles = articles.slice(0, 6);

  if (orderedArticles.length < 1 || orderedArticles.length > 6) {
    throw new Error('La newsletter doit contenir entre 1 et 6 articles.');
  }

  const hero = orderedArticles[0];
  const secondary = orderedArticles.slice(1);

  const heroUrl = buildArticleUrl(hero);
  const heroImage = hero.mainImageUrl || 'https://placehold.co/1200x700/0f172a/ffffff?text=Malakinfo';
  const heroCategory = hero.category?.title || 'Actualités';
  const heroExcerpt = normalizeText(hero.excerpt, 220);
  const footerSocialLinks = [
    {
      label: 'Site web',
      href: 'https://www.malakinfo.com',
      bgColor: '#0F172A',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
    },
    {
      label: 'Facebook',
      href: 'https://web.facebook.com/profile.php?id=61593119312402&locale=fr_FR',
      bgColor: '#1877F2',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
    },
    {
      label: 'X',
      href: 'https://x.com/Malakinfo1',
      bgColor: '#000000',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/5968/5968804.png',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/malakinfo/',
      bgColor: '#E1306C',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
    },
  ];

  const secondaryCards = secondary.map((article) => {
    const articleUrl = buildArticleUrl(article);
    const image = article.mainImageUrl || 'https://placehold.co/600x400/dc2626/ffffff?text=Malakinfo';
    const category = article.category?.title || 'Actualités';
    const title = escapeHtml(article.title);
    const excerpt = escapeHtml(normalizeText(article.excerpt, 120));

    return `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="newsletter-stack newsletter-secondary-row">
            <tr>
              <td colspan="2" class="newsletter-stack-cell newsletter-secondary-image-cell" style="padding: 0 0 10px 0; width: 100%; display:block;">
                <a href="${articleUrl}" style="display:block; text-decoration:none;">
                  <img src="${image}" alt="${title}" width="600" class="newsletter-card-image newsletter-secondary-image" style="display:block; width:100%; max-width:100%; height:auto; border-radius:8px; border:0; background:#f3f4f6;" />
                </a>
              </td>
            </tr>
            <tr>
              <td colspan="2" valign="top" class="newsletter-text-content newsletter-secondary-text-cell" style="width: 100%; display:block;">
                <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #c81f2d; letter-spacing: 0.8px; text-transform: uppercase; margin: 0 0 8px 0;">
                  ${escapeHtml(category)}
                </div>
                <a href="${articleUrl}" style="font-family: Arial, sans-serif; font-size: 20px; line-height: 28px; color: #111827; text-decoration: none; font-weight: bold;">
                  ${title}
                </a>
                <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: #444; margin-top: 8px;">
                  ${excerpt}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `
    ${responsiveNewsletterCss}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="newsletter-shell" style="background:#f5f6f8; margin:0; padding:0;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="newsletter-content" style="max-width:600px; background:#ffffff; border-collapse:collapse; margin:0 auto;">
            <tr>
              <td style="padding: 18px 24px; background:#0d1b3d; text-align:center;">
                <div style="font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 2px; color:#ffffff; text-transform: uppercase; font-weight: bold;">
                  MALAKINFO
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 0;">
                <a href="${heroUrl}" style="display:block; text-decoration:none;">
                  <img src="${heroImage}" alt="${escapeHtml(hero.title)}" width="600" class="newsletter-hero-image" style="display:block; width:100%; max-width:600px; height:auto; border:0; background:#e5e7eb;" />
                </a>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 20px 24px 8px 24px;">
                <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color:#c81f2d; text-transform: uppercase; letter-spacing: 1px;">
                  ${escapeHtml(heroCategory)}
                </div>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 0 24px;">
                <a href="${heroUrl}" class="newsletter-title" style="font-family: Arial, sans-serif; font-size: 30px; line-height: 38px; color:#111827; text-decoration:none; font-weight:bold;">
                  ${escapeHtml(hero.title)}
                </a>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 12px 24px 18px 24px;">
                <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 24px; color:#222222;">
                  ${escapeHtml(heroExcerpt)}
                </div>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 0 24px 24px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td bgcolor="#c81f2d" class="newsletter-button-cell" style="border-radius: 4px;">
                      <a href="${heroUrl}" class="newsletter-button-link" style="display:inline-block; padding: 12px 20px; font-family: Arial, sans-serif; font-size: 13px; line-height: 18px; color:#ffffff; text-decoration:none; font-weight:bold; text-transform: uppercase;">
                        LIRE LA SUITE
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 0 24px 12px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                  ${secondaryCards}
                </table>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 0 24px 18px 24px; text-align:center;">
                <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 20px; color:#0f172a; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 14px 0; border-top: 1px solid #e5e7eb; padding-top: 18px;">
                  Suivez-nous
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; border-collapse: separate;">
                  <tr>
                    ${footerSocialLinks.map((item) => `
                      <td class="newsletter-social-cell" style="padding: 8px 10px; text-align:center; vertical-align: top;">
                        <a href="${item.href}" aria-label="${escapeHtml(item.label)}" class="newsletter-social-link" style="display:inline-block; text-decoration:none;">
                          <div class="newsletter-social-icon" style="display:inline-block; width:36px; height:36px; margin:0 auto 6px auto; background:${item.bgColor}; border-radius:50%; text-align:center; line-height:36px;">
                            <img src="${item.iconImage}" alt="${escapeHtml(item.label)}" width="20" height="20" style="width:20px; height:20px; display:inline-block; vertical-align:middle; border:0;" />
                          </div>
                          <span class="newsletter-social-label" style="display:block; font-family:Arial,sans-serif; font-size:10px; line-height:14px; color:#0f172a; text-align:center;">${escapeHtml(item.label)}</span>
                        </a>
                      </td>
                    `).join('')}
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 18px 24px 28px 24px; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color:#666666; text-align:center;">
                Malakinfo • Actualités, analyses et perspectives
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export type CustomNewsletter = {
  title: string;
  content: string;
  heroImageUrl?: string;
  imageUrls?: string[];
  imageLinkUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
};

const safeUrl = (value: string | undefined) => {
  const url = value?.trim() || '';
  return /^https:\/\//i.test(url) ? url : '';
};

export function generateCustomNewsletterHtml(newsletter: CustomNewsletter) {
  const heroImageUrl = safeUrl(newsletter.heroImageUrl);
  const imageUrls = (newsletter.imageUrls || []).map(safeUrl).filter(Boolean).slice(0, 4);
  const imageLinkUrl = safeUrl(newsletter.imageLinkUrl);
  const buttonUrl = safeUrl(newsletter.buttonUrl);
  const paragraphs = newsletter.content
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 18px 0;">${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
  const images = imageUrls.map((url) => `
    <tr><td style="padding:0 24px 18px 24px;"><img src="${url}" alt="" width="552" style="display:block;width:100%;max-width:552px;height:auto;border:0;border-radius:8px;" /></td></tr>
  `).join('');
  const hero = heroImageUrl
    ? `<tr><td style="padding:0;">${imageLinkUrl ? `<a href="${imageLinkUrl}" style="display:block;text-decoration:none;">` : ''}<img src="${heroImageUrl}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />${imageLinkUrl ? '</a>' : ''}</td></tr>`
    : '';
  const button = buttonUrl && newsletter.buttonLabel?.trim()
    ? `<p style="margin:24px 0 4px 0;"><a href="${buttonUrl}" style="display:inline-block;background:#c81f2d;color:#ffffff;padding:12px 20px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:13px;text-transform:uppercase;">${escapeHtml(newsletter.buttonLabel)}</a></p>`
    : '';

  return `
    ${responsiveNewsletterCss}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f6f8;margin:0;padding:0;">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border-collapse:collapse;margin:0 auto;">
          <tr><td style="padding:18px 24px;background:#0d1b3d;text-align:center;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#ffffff;text-transform:uppercase;font-weight:bold;">MALAKINFO</td></tr>
          ${hero}
          <tr><td class="newsletter-mobile-padding" style="padding:28px 24px 10px 24px;font-family:Arial,sans-serif;font-size:30px;line-height:38px;color:#111827;font-weight:bold;">${escapeHtml(newsletter.title)}</td></tr>
          <tr><td class="newsletter-mobile-padding" style="padding:10px 24px 24px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:26px;color:#222222;">${paragraphs}${button}</td></tr>
          ${images}
          <tr><td style="padding:18px 24px 28px 24px;font-family:Arial,sans-serif;font-size:12px;line-height:18px;color:#666666;text-align:center;border-top:1px solid #e5e7eb;">Malakinfo • Actualités, analyses et perspectives</td></tr>
        </table>
      </td></tr>
    </table>
  `;
}
