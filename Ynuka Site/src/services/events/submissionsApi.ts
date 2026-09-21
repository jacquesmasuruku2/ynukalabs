/**
 * Soumissions publiques speakers / event proposals → Admin Panel API.
 */
import {
  ApiServiceUnavailableError,
  type EventProposalPayload,
  type PublicSubmitResult,
  type SpeakerApplicationPayload,
} from "./submissionsTypes";

export { ApiServiceUnavailableError } from "./submissionsTypes";

const ADMIN_API_BASE = (
  import.meta.env.VITE_ADMIN_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

async function postJson(path: string, body: Record<string, unknown>): Promise<PublicSubmitResult> {
  let response: Response;
  try {
    response = await fetch(`${ADMIN_API_BASE}/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiServiceUnavailableError();
  }

  const data = (await response.json().catch(() => ({}))) as PublicSubmitResult & {
    error?: string;
  };

  if (!response.ok) {
    if (response.status >= 500) throw new ApiServiceUnavailableError();
    throw new Error(data.error || `Erreur ${response.status}`);
  }

  if (data && typeof data === "object" && data.error) {
    throw new Error(String(data.error));
  }

  const ok =
    data?.success === true || data?.status === "pending" || data?.id != null;

  if (!ok) {
    throw new ApiServiceUnavailableError();
  }

  return {
    success: true,
    id: data.id ?? null,
    status: data.status ?? "pending",
    message: data.message,
  };
}

export async function submitSpeakerApplication(
  payload: SpeakerApplicationPayload
): Promise<PublicSubmitResult> {
  // Endpoint speakers à brancher ensuite ; pour l’instant signal clair si absent
  return postJson("/speaker-applications", {
    ...payload,
    phone: payload.phone || null,
    organization: payload.organization || null,
    professional_links: payload.professional_links || null,
    consent: payload.consent ? 1 : 0,
    website: payload.website || "",
  });
}

export async function submitEventProposal(
  payload: EventProposalPayload
): Promise<PublicSubmitResult> {
  return postJson("/event-proposals", {
    ...payload,
    contact_phone: payload.contact_phone || null,
    event_time: payload.event_time || null,
    timezone: payload.timezone || null,
    venue: payload.venue || null,
    online_link: payload.online_link || null,
    audience: payload.audience || null,
    capacity: payload.capacity ?? null,
    publication_channel: payload.publication_channel,
    external_event_url: payload.external_event_url || null,
    registration_mode: payload.registration_mode || null,
    registration_url: payload.registration_url || null,
    image_url: payload.image_url || null,
    image_data: payload.image_data || null,
    image_filename: payload.image_filename || null,
    partners: payload.partners || null,
    speakers: payload.speakers || null,
    consent: payload.consent ? 1 : 0,
    website: payload.website || "",
  });
}
