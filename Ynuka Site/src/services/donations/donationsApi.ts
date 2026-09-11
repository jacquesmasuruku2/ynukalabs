/**
 * Client dons — réutilise strapiFetch (même chemins que Onboarding).
 * En cas d’échec réseau / endpoint manquant : remonte une erreur claire (pas de fausse confirmation).
 */
import { strapiFetch } from "@/lib/strapi";
import type { RdcOperatorId } from "./types";

export class DonationServiceError extends Error {
  readonly code: "UNAVAILABLE" | "FAILED";
  constructor(message: string, code: "UNAVAILABLE" | "FAILED" = "FAILED") {
    super(message);
    this.name = "DonationServiceError";
    this.code = code;
  }
}

function wrapError(error: unknown, fallback: string): never {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  if (
    lower.includes("404") ||
    lower.includes("501") ||
    lower.includes("503") ||
    lower.includes("failed to fetch") ||
    lower.includes("network")
  ) {
    throw new DonationServiceError(fallback, "UNAVAILABLE");
  }
  throw new DonationServiceError(msg || fallback, "FAILED");
}

export async function submitRdcMobileIntent(payload: {
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  amount: number;
  currency: string;
  operator: RdcOperatorId;
  note: string;
  donation_context?: string;
  destination?: string;
  anonymous?: boolean;
}): Promise<{ ok: boolean }> {
  try {
    const res = await strapiFetch<{ ok?: boolean }>("/api/donations/rdc-mobile-intent", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: Boolean(res?.ok) };
  } catch (e) {
    wrapError(e, "RDC mobile intent unavailable");
  }
}

export async function verifyFlutterwaveDonation(payload: {
  transaction_id?: string | number;
  tx_ref?: string;
  payer: { name: string; email: string; phone: string };
}): Promise<{ ok: boolean; status?: string }> {
  try {
    const res = await strapiFetch<{ ok?: boolean; status?: string }>(
      "/api/donations/verify-flutterwave",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return { ok: Boolean(res?.ok), status: res?.status };
  } catch (e) {
    wrapError(e, "Flutterwave verify unavailable");
  }
}

export async function submitCryptoIntent(payload: Record<string, unknown>): Promise<{ ok: boolean }> {
  try {
    const res = await strapiFetch<{ ok?: boolean }>("/api/donations/crypto-intent", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: Boolean(res?.ok) };
  } catch (e) {
    wrapError(e, "Crypto intent unavailable");
  }
}
