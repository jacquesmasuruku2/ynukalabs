/**
 * Contrats API — candidatures speakers & propositions d’événements
 *
 * Backend PHP attendu (autre développeur) :
 *
 * POST action=create&resource=event_proposals
 * Body JSON (allowlist) → status forcé "pending"
 * Champs utiles :
 *   publication_channel: "ynuka_agenda" | "external"
 *   external_event_url? (si external)
 *   registration_mode?: "ynuka_modal" | "external_url" (si ynuka_agenda)
 *   registration_url?
 *   venue?, online_link?
 *   image_url? | image_data? (data URL JPEG) + image_filename?
 *   … champs contact / event classiques
 *
 * Jamais de list/get public. Pas de publication auto.
 */

export type SpeakerPreferredFormat = "in_person" | "online" | "both";

export type SpeakerApplicationPayload = {
  full_name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  topic_title: string;
  topic_description: string;
  expertise: string;
  preferred_format: SpeakerPreferredFormat;
  language: string;
  biography: string;
  professional_links?: string | null;
  consent: boolean;
  /** Honeypot — doit rester vide */
  website?: string;
};

export type EventProposalCategory = "Workshop" | "Hackathon" | "Meetup";
export type EventProposalFormat = "in_person" | "online" | "hybrid";
export type EventPublicationChannel = "ynuka_agenda" | "external";
export type EventRegistrationMode = "ynuka_modal" | "external_url";

export type EventProposalPayload = {
  contact_name: string;
  contact_email: string;
  contact_phone?: string | null;
  organization: string;
  title: string;
  description: string;
  category: EventProposalCategory;
  event_date: string;
  event_time?: string | null;
  timezone?: string | null;
  format: EventProposalFormat;
  /** Compat : lieu et/ou lien fusionnés */
  location_or_link: string;
  venue?: string | null;
  online_link?: string | null;
  audience?: string | null;
  capacity?: number | null;
  publication_channel: EventPublicationChannel;
  external_event_url?: string | null;
  registration_mode?: EventRegistrationMode | null;
  registration_url?: string | null;
  image_url?: string | null;
  image_data?: string | null;
  image_filename?: string | null;
  partners?: string | null;
  speakers?: string | null;
  consent: boolean;
  website?: string;
};

export type PublicSubmitResult = {
  success: boolean;
  id?: string | number | null;
  status?: string;
  message?: string;
};

export class ApiServiceUnavailableError extends Error {
  readonly code = "SERVICE_UNAVAILABLE" as const;
  constructor(message = "Service temporarily unavailable") {
    super(message);
    this.name = "ApiServiceUnavailableError";
  }
}
