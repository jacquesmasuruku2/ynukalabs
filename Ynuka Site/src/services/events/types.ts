/**
 * Contrats Events (frontend ↔ backend PHP).
 *
 * Backend attendu (spécification Phase A, hors scope frontend) :
 * - GET  action=list&resource=events  → lignes publiées
 * - GET  action=get&resource=events&id=
 * - POST action=create&resource=event_registrations (auth public)
 *
 * Colonnes enrichissement attendues (nullable si absentes en prod) :
 * format, timezone, organizer, speakers, partners, audience,
 * recap_url, youtube_url, resources, registration_url, published, time, image_url
 *
 * Catégories `type` existantes : Workshop | Hackathon | Meetup
 * Formats `format` : in_person | online | hybrid | null (= non classé)
 */

export type EventCategory = "Workshop" | "Hackathon" | "Meetup" | string;

export type EventFormat = "in_person" | "online" | "hybrid";

/** Événement normalisé côté frontend (aucune donnée inventée). */
export type YnukaEvent = {
  id: string;
  title: string;
  titleFr: string | null;
  description: string | null;
  descriptionFr: string | null;
  /** Date ISO ou chaîne renvoyée par l’API */
  date: string;
  location: string;
  type: EventCategory;
  upcoming: boolean;
  time: string | null;
  imageUrl: string | null;
  capacity: number | null;
  /** null / undefined = non classé (ne pas assimilier au présentiel ou en ligne) */
  format: EventFormat | null;
  timezone: string | null;
  organizer: string | null;
  speakers: string | null;
  partners: string | null;
  audience: string | null;
  recapUrl: string | null;
  youtubeUrl: string | null;
  resources: string | null;
  registrationUrl: string | null;
  published: boolean | null;
};

export type EventAgendaFilter =
  | "All"
  | "Upcoming"
  | "Past"
  | "InPerson"
  | "Online"
  | "Workshop"
  | "Hackathon"
  | "Meetup";

export type EventRegistrationPayload = {
  event_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  message?: string | null;
  avatarUrl?: string | null;
  googleSub?: string | null;
};
