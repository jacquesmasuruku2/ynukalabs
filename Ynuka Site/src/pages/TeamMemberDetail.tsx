import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Globe, LinkedinLogo, TelegramLogo, XLogo } from "@phosphor-icons/react";
import { teamMembers, type TeamMember } from "@/data/teamMembers";
import { mediaToUrl, strapiFetch } from "@/lib/strapi";

const TeamMemberDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [member, setMember] = useState<TeamMember | null>(teamMembers.find((item) => item.slug === slug) ?? null);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const adminApiUrl = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
        const response = adminApiUrl
          ? { rows: await fetch(`${adminApiUrl.replace(/\/$/, "")}/api/team-members?slug=${encodeURIComponent(slug ?? "")}`).then((result) => result.json()) }
          : await strapiFetch<{ data?: unknown[]; rows?: unknown[] }>(`/api/team-members?filters[slug][$eq]=${slug}&populate=image`);
        const item = (response.data ?? response.rows ?? [])[0] as { attributes?: Record<string, unknown>; slug?: string; name?: string; role?: string; description?: string; imageUrl?: string; xUrl?: string; linkedinUrl?: string; telegramUrl?: string; portfolioUrl?: string } | undefined;
        const attrs = item?.attributes ?? item;
        if (!attrs) return;
        setMember({
          slug: String(attrs.slug ?? slug),
          name: String(attrs.name ?? ""),
          role: String(attrs.role ?? ""),
          description: String(attrs.description ?? ""),
          portfolioUrl: String(attrs.portfolioUrl ?? attrs.portfolio_url ?? ""),
          image: mediaToUrl(attrs.image ?? attrs.imageUrl) ?? "",
          social: {
            x: String(attrs.social_x ?? attrs.x ?? attrs.xUrl ?? ""),
            telegram: String(attrs.social_telegram ?? attrs.telegram ?? attrs.telegramUrl ?? ""),
            linkedin: String(attrs.social_linkedin ?? attrs.linkedin ?? attrs.linkedinUrl ?? ""),
          },
        });
      } catch {
        // Keep the local profile when the public API is unavailable.
      }
    };
    if (slug) loadMember();
  }, [slug]);

  if (!member) return <div className="py-32 text-center text-white">Membre introuvable.</div>;

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] py-16 text-white">
      <div className="container mx-auto max-w-4xl px-4">
        <Link to="/team" className="mb-8 inline-flex items-center gap-2 text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4" /> Retour à l'équipe</Link>
        <article className="grid gap-8 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 md:grid-cols-[240px_1fr] md:p-10">
          <div className="mx-auto h-56 w-56 overflow-hidden rounded-2xl bg-white/10">
            {member.image && !member.image.startsWith("TO_ADD_") ? <img src={member.image} alt={member.name} className="h-full w-full object-cover" /> : <Users className="m-20 h-16 w-16 text-white/50" />}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Ynuka Labs</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">{member.name}</h1>
            <p className="mt-3 text-xl text-amber-300">{member.role}</p>
            <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: member.description || "Aucune description disponible pour le moment." }} />
            <div className="mt-8 flex gap-3">
              {member.portfolioUrl?.startsWith("http") && <a href={member.portfolioUrl} target="_blank" rel="noreferrer" aria-label="Portfolio" title="Portfolio" className="rounded-full bg-white/10 p-3"><Globe weight="bold" className="h-5 w-5" /></a>}
              {member.social.x.startsWith("http") && <a href={member.social.x} target="_blank" rel="noreferrer" aria-label="X" title="X" className="rounded-full bg-white/10 p-3"><XLogo weight="bold" className="h-5 w-5" /></a>}
              {member.social.linkedin.startsWith("http") && <a href={member.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn" className="rounded-full bg-white/10 p-3"><LinkedinLogo weight="bold" className="h-5 w-5" /></a>}
              {member.social.telegram.startsWith("http") && <a href={member.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram" className="rounded-full bg-white/10 p-3"><TelegramLogo weight="bold" className="h-5 w-5" /></a>}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default TeamMemberDetail;