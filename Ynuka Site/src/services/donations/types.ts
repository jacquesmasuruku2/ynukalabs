/**
 * Contrats dons / soutiens (frontend ↔ Strapi donations API).
 *
 * Endpoints attendus (auth: false côté Strapi) :
 * - POST /api/donations/rdc-mobile-intent
 * - POST /api/donations/verify-flutterwave
 * - POST /api/donations/crypto-intent
 * - POST /api/donations/flutterwave/webhook (serveur only)
 *
 * Champs utiles à enrichir côté backend (spécification) :
 * donation_context, destination, related_event_id, related_project_id,
 * anonymous, donor_email, donor_phone (si public — remerciement),
 * status: pending | manual_review | confirmed | failed | cancelled
 *
 * Mobile Money RDC → toujours vérification manuelle (jamais confirmé auto).
 * Flutterwave → confirmé seulement si verify.ok && status === "confirmed".
 * Cardano mainnet → pending / manual_review jusqu’à vérif admin.
 * Cardano preprod → tx_hash possible via CIP-30.
 */

export type DonationContext =
  | "onboarding_program"
  | "support_page"
  | "community_call"
  | string;

export type SupportDestinationId =
  | "general"
  | "education"
  | "digital_projects"
  | "environment"
  | "charitable_actions"
  | "specific_project"
  | "specific_event"
  /** Alias / focus legacy (redirigés vers education côté UI) */
  | "community_events"
  | "onboarding_program"
  | "community_call";

export type DonorVisibility = "anonymous" | "public";

export type RdcOperatorId = "orange" | "airtel" | "vodacom" | "africel";

export type DonatePanelProps = {
  /** Contexte métier envoyé au backend */
  donationContext: DonationContext;
  /** Destination indicative du soutien */
  destination?: SupportDestinationId;
  relatedEventId?: string | null;
  relatedProjectId?: string | null;
  /** Afficher le titre interne du panneau */
  showTitle?: boolean;
  className?: string;
};
