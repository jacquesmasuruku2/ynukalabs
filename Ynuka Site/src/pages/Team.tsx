import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, X, MessageCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import { teamMembers, type TeamMember } from "@/data/teamMembers";
import { mediaToUrl, strapiFetch } from "@/lib/strapi";

// Custom LinkedIn icon since it's not available in lucide-react
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

function teamMembersWithValidImages(members: TeamMember[]): TeamMember[] {
  return members.filter(
    (m) =>
      Boolean(m.image?.trim()) &&
      !m.image.startsWith("TO_ADD_") &&
      !m.image.startsWith("http://TO_ADD") &&
      !m.name.toLowerCase().includes("frederic samvura") &&
      !m.name.toLowerCase().includes("frédéric samvura")
  );
}

const Team = () => {
  const [team, setTeam] = useState<TeamMember[]>(teamMembers);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const adminApiUrl = import.meta.env.VITE_ADMIN_API_URL as string | undefined;
        const res = adminApiUrl
          ? await fetch(`${adminApiUrl.replace(/\/$/, "")}/api/team-members`).then((response) => response.json())
          : await strapiFetch<{ data?: unknown[]; rows?: unknown[] }>("/api/team-members?populate=image&pagination[pageSize]=100");
        const items = res.data ?? res.rows ?? [];

        const mapped: TeamMember[] = items
          .map((item) => {
            const it = item as { id?: string | number; attributes?: Record<string, unknown> };
            const attrs = (it.attributes ?? {}) as Record<string, unknown>;
            const imageUrl = mediaToUrl(attrs.image ?? attrs.imageUrl) ?? "";

            return {
              slug: String(attrs.slug ?? String(attrs.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
              name: String(attrs.name ?? ""),
              role: String(attrs.role ?? ""),
              image: imageUrl,
              description: String(attrs.description ?? attrs.bio ?? ""),
              social: {
                x: String(attrs.social_x ?? attrs.x ?? attrs.xUrl ?? ""),
                telegram: String(attrs.social_telegram ?? attrs.telegram ?? attrs.telegramUrl ?? ""),
                linkedin: String(attrs.social_linkedin ?? attrs.linkedin ?? attrs.linkedinUrl ?? ""),
              },
            } satisfies TeamMember;
          })
          .filter((m) => m.name && m.role);

        const filtered = mapped.filter(
          (member) =>
            !member.name.toLowerCase().includes("frederic samvura") &&
            !member.name.toLowerCase().includes("frédéric samvura")
        );

        if (filtered.length) setTeam(filtered);
      } catch {
        // fallback: teamMembers local
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg)" }}>
      {/* Team Section */}
      <section className="about-section py-12">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">
              Notre{" "}
              <span style={{ color: "var(--accent-logo-blue)" }}>Équipe</span>
            </h2>
          </motion.div>

          <div className="team-grid">
            {team.map((member, i) => {
              const hasX = member.social.x.startsWith("http");
              const hasTelegram = member.social.telegram.startsWith("http");
              const hasLinkedIn = member.social.linkedin.startsWith("http");
              const hasAnySocial = hasX || hasTelegram || hasLinkedIn;

              return (
                <Link to={`/team/${member.slug}`} className="block">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{
                    opacity: { duration: 0.5, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
                    y: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  viewport={{ once: true }}
                  className="team-card"
                >
                  <div className="team-media">
                    <div className="team-avatar">
                      {member.image && !member.image.startsWith("TO_ADD_") ? (
                        <img src={member.image} alt={member.name} loading="lazy" />
                      ) : (
                        <div className="team-avatar-placeholder">
                          <Users
                            className="w-10 h-10"
                            style={{ color: "var(--accent-logo-blue)" }}
                          />
                        </div>
                      )}
                    </div>

                    {hasAnySocial && (
                      <div className="team-overlay-socials">
                        {hasX && (
                          <a
                            href={member.social.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-social-link"
                            aria-label={`Compte X de ${member.name}`}
                          >
                            <X className="w-4 h-4" />
                          </a>
                        )}
                        {hasLinkedIn && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-social-link"
                            aria-label={`Compte LinkedIn de ${member.name}`}
                          >
                            <LinkedinIcon className="w-4 h-4" />
                          </a>
                        )}
                        {hasTelegram && (
                          <a
                            href={member.social.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-social-link"
                            aria-label={`Compte Telegram de ${member.name}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="team-meta">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                  </div>
                </motion.div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Team;
