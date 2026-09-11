/**
 * Soumissions publiques speakers / event proposals.
 * Si l’endpoint backend n’existe pas encore → ApiServiceUnavailableError
 * (jamais de fausse réussite côté UI).
 */
import { fetchFromApi } from "@/lib/api";
import {
  ApiServiceUnavailableError,
  type EventProposalPayload,
  type PublicSubmitResult,
  type SpeakerApplicationPayload,
} from "./submissionsTypes";

export { ApiServiceUnavailableError } from "./submissionsTypes";

function isLikelyMissingResource(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  return (
    lower.includes("invalid resource") ||
    lower.includes("unknown table") ||
    lower.includes("doesn't exist") ||
    lower.includes("does not exist") ||
    lower.includes("no such table") ||
    lower.includes("404") ||
    lower.includes("501") ||
    lower.includes("503")
  );
}

async function createPublicResource(
  resource: "speaker_applications" | "event_proposals",
  body: Record<string, unknown>
): Promise<PublicSubmitResult> {
  try {
    const result = await fetchFromApi<PublicSubmitResult & { error?: string }>(
      "create",
      { resource },
      body
    );

    if (result && typeof result === "object" && "error" in result && result.error) {
      throw new Error(String(result.error));
    }

    const ok =
      result?.success === true ||
      result?.status === "pending" ||
      result?.id != null;

    if (!ok) {
      throw new ApiServiceUnavailableError();
    }

    return {
      success: true,
      id: result.id ?? null,
      status: result.status ?? "pending",
      message: result.message,
    };
  } catch (error) {
    if (error instanceof ApiServiceUnavailableError) throw error;
    if (isLikelyMissingResource(error)) {
      throw new ApiServiceUnavailableError();
    }
    throw error;
  }
}

export async function submitSpeakerApplication(
  payload: SpeakerApplicationPayload
): Promise<PublicSubmitResult> {
  return createPublicResource("speaker_applications", {
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
  return createPublicResource("event_proposals", {
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
