type FlutterwaveTx = {
  id?: number | string;
  tx_ref?: string;
  amount?: number;
  currency?: string;
  status?: string;
  payment_type?: string;
  customer?: {
    name?: string;
    email?: string;
    phone_number?: string;
  };
  meta?: Record<string, unknown>;
};

const DONATION_UID = "api::donation.donation";

function mapFlutterwaveStatus(status?: string): "pending" | "confirmed" | "failed" | "manual_review" {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (s === "successful") return "confirmed";
  if (s === "failed" || s === "cancelled") return "failed";
  return "pending";
}

async function verifyFlutterwaveTransaction(secretKey: string, transactionId?: string | number, txRef?: string) {
  if (!transactionId && !txRef) {
    throw new Error("transaction_id or tx_ref is required");
  }

  if (transactionId) {
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Flutterwave verify failed: ${res.status} ${text}`);
    }
    const payload = (await res.json()) as { data?: FlutterwaveTx };
    return payload.data ?? null;
  }

  const res = await fetch(`https://api.flutterwave.com/v3/transactions?tx_ref=${encodeURIComponent(String(txRef))}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flutterwave tx query failed: ${res.status} ${text}`);
  }
  const payload = (await res.json()) as { data?: FlutterwaveTx[] };
  return payload.data?.[0] ?? null;
}

async function upsertDonation(strapi: any, data: Record<string, unknown>) {
  const txRef = String(data.tx_ref ?? "");
  if (!txRef) {
    return strapi.db.query(DONATION_UID).create({ data });
  }

  const existing = await strapi.db.query(DONATION_UID).findOne({
    where: { tx_ref: txRef },
  });

  if (existing?.id) {
    return strapi.db.query(DONATION_UID).update({
      where: { id: existing.id },
      data,
    });
  }

  return strapi.db.query(DONATION_UID).create({ data });
}

export default {
  async verifyFlutterwave(ctx: any) {
    try {
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secretKey) {
        return ctx.internalServerError("Missing FLUTTERWAVE_SECRET_KEY");
      }

      const body = (ctx.request.body ?? {}) as {
        transaction_id?: string | number;
        tx_ref?: string;
        payer?: { name?: string; email?: string; phone?: string };
      };

      const tx = await verifyFlutterwaveTransaction(secretKey, body.transaction_id, body.tx_ref);
      if (!tx) {
        return ctx.badRequest("Transaction not found");
      }

      const status = mapFlutterwaveStatus(tx.status);
      const donation = await upsertDonation(strapi, {
        method: "mobile_money",
        provider: "flutterwave",
        network: String((tx.meta?.mobile_network as string) ?? ""),
        status,
        amount: Number(tx.amount ?? 0),
        currency: String(tx.currency ?? "USD"),
        tx_ref: String(tx.tx_ref ?? body.tx_ref ?? ""),
        transaction_id: String(tx.id ?? body.transaction_id ?? ""),
        donor_name: String(tx.customer?.name ?? body.payer?.name ?? ""),
        donor_email: String(tx.customer?.email ?? body.payer?.email ?? ""),
        donor_phone: String(tx.customer?.phone_number ?? body.payer?.phone ?? ""),
        raw_payload: tx,
      });

      ctx.body = {
        ok: true,
        status,
        donationId: donation?.id ?? null,
      };
    } catch (error: any) {
      strapi.log.error("verifyFlutterwave error", error);
      ctx.internalServerError(error?.message ?? "Verification failed");
    }
  },

  async flutterwaveWebhook(ctx: any) {
    try {
      const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
      const verifHash = ctx.request.headers["verif-hash"];

      if (webhookSecret && verifHash !== webhookSecret) {
        return ctx.unauthorized("Invalid webhook signature");
      }

      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secretKey) {
        return ctx.internalServerError("Missing FLUTTERWAVE_SECRET_KEY");
      }

      const event = (ctx.request.body ?? {}) as {
        event?: string;
        data?: FlutterwaveTx;
      };

      const txId = event.data?.id;
      const txRef = event.data?.tx_ref;
      const tx = await verifyFlutterwaveTransaction(secretKey, txId, txRef);
      if (!tx) {
        return ctx.badRequest("Transaction not found");
      }

      await upsertDonation(strapi, {
        method: "mobile_money",
        provider: "flutterwave",
        network: String((tx.meta?.mobile_network as string) ?? ""),
        status: mapFlutterwaveStatus(tx.status),
        amount: Number(tx.amount ?? 0),
        currency: String(tx.currency ?? "USD"),
        tx_ref: String(tx.tx_ref ?? ""),
        transaction_id: String(tx.id ?? ""),
        donor_name: String(tx.customer?.name ?? ""),
        donor_email: String(tx.customer?.email ?? ""),
        donor_phone: String(tx.customer?.phone_number ?? ""),
        raw_payload: event,
      });

      ctx.body = { ok: true };
    } catch (error: any) {
      strapi.log.error("flutterwaveWebhook error", error);
      ctx.internalServerError(error?.message ?? "Webhook failed");
    }
  },

  async rdcMobileIntent(ctx: any) {
    try {
      const body = (ctx.request.body ?? {}) as {
        donor_name?: string;
        donor_email?: string;
        donor_phone?: string;
        amount?: string | number;
        currency?: string;
        operator?: string;
        note?: string;
      };

      const allowed = ["orange", "airtel", "vodacom", "africel"];
      const op = String(body.operator ?? "").toLowerCase();
      if (!allowed.includes(op)) {
        return ctx.badRequest("Invalid operator");
      }

      const donation = await strapi.db.query(DONATION_UID).create({
        data: {
          method: "mobile_money",
          provider: "rdc-operator",
          network: op,
          status: "manual_review",
          amount: Number(body.amount ?? 0),
          currency: String(body.currency ?? "USD"),
          donor_name: String(body.donor_name ?? ""),
          donor_email: String(body.donor_email ?? ""),
          donor_phone: String(body.donor_phone ?? ""),
          note: String(body.note ?? "RDC Mobile Money — demande depuis onboarding"),
          raw_payload: body,
        },
      });

      ctx.body = {
        ok: true,
        donationId: donation?.id ?? null,
      };
    } catch (error: any) {
      strapi.log.error("rdcMobileIntent error", error);
      ctx.internalServerError(error?.message ?? "RDC mobile intent failed");
    }
  },

  async cryptoIntent(ctx: any) {
    try {
      const body = (ctx.request.body ?? {}) as {
        donor_name?: string;
        donor_email?: string;
        donor_phone?: string;
        amount?: string | number;
        currency?: string;
        tx_hash?: string;
        wallet_address?: string;
        note?: string;
      };

      const donation = await strapi.db.query(DONATION_UID).create({
        data: {
          method: "crypto",
          provider: "cardano-direct",
          status: "manual_review",
          amount: Number(body.amount ?? 0),
          currency: String(body.currency ?? "ADA"),
          tx_hash: String(body.tx_hash ?? ""),
          wallet_address: String(body.wallet_address ?? ""),
          donor_name: String(body.donor_name ?? ""),
          donor_email: String(body.donor_email ?? ""),
          donor_phone: String(body.donor_phone ?? ""),
          note: String(body.note ?? "Manual crypto confirmation from onboarding page"),
          raw_payload: body,
        },
      });

      ctx.body = {
        ok: true,
        donationId: donation?.id ?? null,
      };
    } catch (error: any) {
      strapi.log.error("cryptoIntent error", error);
      ctx.internalServerError(error?.message ?? "Crypto intent failed");
    }
  },
};
