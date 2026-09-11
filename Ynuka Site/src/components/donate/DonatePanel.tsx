import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CreditCard, HandCoins, Loader2, Smartphone, Wallet } from "lucide-react";
import type { IWallet } from "@meshsdk/common";
import { listCip30Wallets, preprodTxExplorerUrl, submitAdaDonationPreprod } from "@/lib/cardanoPreprodDonation";
import { cn } from "@/lib/utils";
import {
  submitCryptoIntent,
  submitRdcMobileIntent,
  verifyFlutterwaveDonation,
} from "@/services/donations/donationsApi";
import type { DonatePanelProps, DonorVisibility, RdcOperatorId } from "@/services/donations/types";

const RDC_OPERATOR_IDS = ["orange", "airtel", "vodacom", "africel"] as const;

const RDC_OPERATOR_LOGOS: Record<RdcOperatorId, string> = {
  orange: "/donations/mobile-money-logos/orange.png",
  airtel: "/donations/mobile-money-logos/airtel.png",
  vodacom: "/donations/mobile-money-logos/vodacom.png",
  africel: "/donations/mobile-money-logos/africel.png",
};

const RDC_LOGO_FALLBACK: Record<RdcOperatorId, string> = {
  orange: "OM",
  airtel: "AM",
  vodacom: "V",
  africel: "AF",
};

const MAINNET_ADDRESS_FALLBACK =
  "addr1qx9nr0z089h9pp8q6g4mr9zvjygp6s3rh03v2e05reyk7zlucfqrm58pch6tnppvp8yw58t6s9n0sxeeq5avqhdw6x5qn4vyzg";

type MobileSubview = "menu" | "rdc-logos" | "rdc-form" | "flutterwave";

const DonatePanel = ({
  donationContext,
  destination,
  relatedEventId,
  relatedProjectId,
  showTitle = true,
  className,
}: DonatePanelProps) => {
  const { t } = useTranslation();
  const [donateMethod, setDonateMethod] = useState<"mobile" | "crypto" | null>(null);
  const [mobileSubview, setMobileSubview] = useState<MobileSubview>("menu");
  const [rdcOperator, setRdcOperator] = useState<RdcOperatorId | null>(null);
  const [rdcLogoFailed, setRdcLogoFailed] = useState<Partial<Record<RdcOperatorId, boolean>>>({});
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorVisibility, setDonorVisibility] = useState<DonorVisibility | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donateError, setDonateError] = useState("");
  const [donateSuccess, setDonateSuccess] = useState("");
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [cryptoConfirmed, setCryptoConfirmed] = useState(false);
  const [cryptoAdaAmount, setCryptoAdaAmount] = useState("");
  const [cryptoPayStep, setCryptoPayStep] = useState<"idle" | "wallets" | "review">("idle");
  const [cryptoPreprodBusy, setCryptoPreprodBusy] = useState(false);
  const [cryptoPreprodTxHash, setCryptoPreprodTxHash] = useState("");
  const [cryptoSelectedWalletName, setCryptoSelectedWalletName] = useState("");
  const cryptoPreprodWalletRef = useRef<IWallet | null>(null);

  const blockfrostPreprodId = import.meta.env.VITE_BLOCKFROST_PREPROD_PROJECT_ID as string | undefined;
  const treasuryPreprod = import.meta.env.VITE_CARDANO_DONATION_ADDRESS_PREPROD as string | undefined;
  const cardanoWalletAddress =
    (import.meta.env.VITE_CARDANO_DONATION_ADDRESS_MAINNET as string | undefined)?.trim() ||
    MAINNET_ADDRESS_FALLBACK;

  const cipWallets = useMemo(() => (cryptoPayStep === "wallets" ? listCip30Wallets() : []), [cryptoPayStep]);

  const relatedMeta = {
    ...(relatedEventId ? { related_event_id: relatedEventId } : {}),
    ...(relatedProjectId ? { related_project_id: relatedProjectId } : {}),
    ...(destination ? { destination } : {}),
    donation_context: donationContext,
    anonymous: donorVisibility === "anonymous",
  };

  const resolvedDonor = () => {
    if (donorVisibility === "anonymous") {
      return {
        name: donorName.trim() || "Anonyme",
        email: "anonymous@ynukalabs.local",
        phone: "n/a",
      };
    }
    return {
      name: donorName.trim() || "Donateur",
      email: donorEmail.trim(),
      phone: donorPhone.trim(),
    };
  };

  useEffect(() => {
    if (donateMethod === "mobile") {
      setMobileSubview("menu");
      setRdcOperator(null);
      setRdcLogoFailed({});
    }
  }, [donateMethod]);

  useEffect(() => {
    const scriptId = "flutterwave-checkout-script";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (donateMethod !== "crypto") {
      setCryptoPayStep("idle");
      setCryptoAdaAmount("");
      setCryptoPreprodTxHash("");
      setCryptoSelectedWalletName("");
      cryptoPreprodWalletRef.current = null;
      setCryptoPreprodBusy(false);
    }
  }, [donateMethod]);

  const validateMobileDonorFields = (amount: number) => {
    if (!donorVisibility) return t("support.visibilityRequired");
    if (!Number.isFinite(amount) || amount <= 0) return t("onboarding.mobileErrorAmount");
    if (donorVisibility === "public") {
      if (!donorEmail.trim()) return t("onboarding.mobileErrorEmail");
      if (!donorPhone.trim()) return t("onboarding.mobileErrorPhone");
    }
    return null;
  };

  const handleFlutterwaveDonate = () => {
    setDonateError("");
    setDonateSuccess("");
    const amount = Number(donationAmount);
    const err = validateMobileDonorFields(amount);
    if (err) {
      setDonateError(err);
      return;
    }

    const flwPubKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string | undefined;
    if (!flwPubKey) {
      setDonateError(t("onboarding.mobileFlutterwaveKeyError"));
      return;
    }

    const checkout = (window as Window & { FlutterwaveCheckout?: (options: Record<string, unknown>) => void })
      .FlutterwaveCheckout;

    if (!checkout) {
      setDonateError(t("onboarding.mobileFlutterwaveScriptError"));
      return;
    }

    const txRef = `ynuka-donate-${Date.now()}`;
    const donor = resolvedDonor();
    checkout({
      public_key: flwPubKey,
      tx_ref: txRef,
      amount,
      currency: "USD",
      payment_options: "card,mobilemoney,ussd",
      customer: {
        email: donor.email,
        phonenumber: donor.phone === "n/a" ? "0000000000" : donor.phone,
        name: donor.name,
      },
      customizations: {
        title: "Ynuka Labs Donation",
        description: t("onboarding.mobileFlutterwaveCheckoutDesc"),
        logo: `${window.location.origin}/favicon.ico`,
      },
      meta: {
        donation_channel: "flutterwave",
        ...relatedMeta,
      },
      callback: async (response: unknown) => {
        try {
          const r = (response ?? {}) as { transaction_id?: string | number; tx_ref?: string };
          if (!r.transaction_id && !r.tx_ref) {
            setDonateError(t("onboarding.mobileFlutterwaveResponseError"));
            return;
          }
          setIsSubmittingDonation(true);
          const verify = await verifyFlutterwaveDonation({
            transaction_id: r.transaction_id,
            tx_ref: r.tx_ref,
            payer: {
              name: donor.name,
              email: donor.email,
              phone: donor.phone,
            },
          });
          if (verify.ok && verify.status === "confirmed") {
            setDonateSuccess(t("onboarding.mobileFlutterwaveSuccessConfirmed"));
            setDonateError("");
          } else if (verify.ok) {
            setDonateSuccess(t("onboarding.mobileFlutterwaveSuccessPending"));
          } else {
            setDonateError(t("onboarding.mobileFlutterwaveVerifyFailed"));
          }
        } catch {
          setDonateError(t("onboarding.mobileFlutterwaveVerifyServerError"));
        } finally {
          setIsSubmittingDonation(false);
        }
      },
      onclose: () => {
        // no-op
      },
    });
  };

  const handleRdcMobileSubmit = async () => {
    if (!rdcOperator) return;
    setDonateError("");
    setDonateSuccess("");
    const amount = Number(donationAmount);
    const err = validateMobileDonorFields(amount);
    if (err) {
      setDonateError(err);
      return;
    }
    try {
      setIsSubmittingDonation(true);
      const donor = resolvedDonor();
      const res = await submitRdcMobileIntent({
        donor_name: donor.name,
        donor_email: donor.email,
        donor_phone: donor.phone,
        amount,
        currency: "USD",
        operator: rdcOperator,
        note: `${donationContext} : ${rdcOperator}${destination ? ` → ${destination}` : ""}`,
        donation_context: donationContext,
        destination,
        anonymous: donorVisibility === "anonymous",
      });
      if (res.ok) {
        setDonateSuccess(t("onboarding.mobileRdcSubmitSuccess"));
        setDonateError("");
      } else {
        setDonateError(t("onboarding.mobileRdcSubmitError"));
      }
    } catch {
      setDonateError(t("onboarding.mobileRdcSubmitError"));
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  const copyWalletAddress = async () => {
    try {
      await navigator.clipboard.writeText(cardanoWalletAddress);
      setDonateError("");
    } catch {
      setDonateError("Copie impossible automatiquement. Veuillez copier l'adresse manuellement.");
    }
  };

  const handleCryptoIntent = async () => {
    setDonateError("");
    setDonateSuccess("");
    if (!donorVisibility) {
      setDonateError(t("support.visibilityRequired"));
      return;
    }
    if (donorVisibility === "public") {
      if (!donorEmail.trim()) {
        setDonateError(t("onboarding.mobileErrorEmail"));
        return;
      }
      if (!donorPhone.trim()) {
        setDonateError(t("onboarding.mobileErrorPhone"));
        return;
      }
    }
    try {
      setIsSubmittingDonation(true);
      const amount = Number(donationAmount || "0");
      const donor = resolvedDonor();
      const res = await submitCryptoIntent({
        donor_name: donor.name,
        donor_email: donor.email,
        donor_phone: donor.phone,
        amount: Number.isFinite(amount) ? amount : 0,
        currency: "ADA",
        wallet_address: cardanoWalletAddress,
        network: "mainnet",
        note: `User confirmed manual crypto donation (${donationContext})${destination ? ` → ${destination}` : ""}`,
        ...relatedMeta,
      });
      if (res.ok) {
        setCryptoConfirmed(true);
        setDonateSuccess("Merci. Votre don crypto a été enregistré pour vérification manuelle.");
      } else {
        setDonateError("Impossible d'enregistrer votre don crypto pour le moment.");
      }
    } catch {
      setDonateError("Erreur serveur lors de l'enregistrement du don crypto.");
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  const handleCryptoPreprodContinue = () => {
    setDonateError("");
    setDonateSuccess("");
    const bf = blockfrostPreprodId?.trim();
    const tr = treasuryPreprod?.trim();
    if (!bf || !tr) {
      setDonateError(t("onboarding.preprodMissingEnv"));
      return;
    }
    if (!tr.startsWith("addr_test1")) {
      setDonateError(t("onboarding.preprodInvalidTreasury"));
      return;
    }
    const ada = Number(String(cryptoAdaAmount).replace(",", "."));
    if (!Number.isFinite(ada) || ada < 1) {
      setDonateError(t("onboarding.cryptoPayInvalidAda"));
      return;
    }
    if (listCip30Wallets().length === 0) {
      setDonateError(t("onboarding.preprodNoWallets"));
      return;
    }
    setCryptoPayStep("wallets");
  };

  const handlePreprodWalletSelect = async (walletId: string, displayName: string) => {
    setDonateError("");
    setCryptoPreprodBusy(true);
    try {
      const { BrowserWallet } = await import("@meshsdk/core");
      const w = await BrowserWallet.enable(walletId);
      const networkId = await w.getNetworkId();
      if (networkId === 1) {
        setDonateError(t("onboarding.preprodMainnetWallet"));
        return;
      }
      cryptoPreprodWalletRef.current = w;
      setCryptoSelectedWalletName(displayName);
      setCryptoPayStep("review");
    } catch {
      setDonateError(t("onboarding.preprodWalletRejected"));
    } finally {
      setCryptoPreprodBusy(false);
    }
  };

  const handlePreprodConfirmSign = async () => {
    const wallet = cryptoPreprodWalletRef.current;
    const bf = blockfrostPreprodId?.trim();
    const tr = treasuryPreprod?.trim();
    const ada = Number(String(cryptoAdaAmount).replace(",", "."));
    if (!wallet || !bf || !tr || !Number.isFinite(ada) || ada < 1) {
      setDonateError(t("onboarding.preprodMissingEnv"));
      return;
    }
    setDonateError("");
    setCryptoPreprodBusy(true);
    try {
      const txHash = await submitAdaDonationPreprod({
        blockfrostProjectId: bf,
        treasuryAddress: tr,
        adaAmount: ada,
        wallet,
      });
      setCryptoPreprodTxHash(txHash);
      cryptoPreprodWalletRef.current = null;
      try {
        await submitCryptoIntent({
          donor_name: donorName.trim() || "Wallet Preprod",
          donor_email: donorEmail.trim() || "preprod@donation.local",
          donor_phone: donorPhone.trim() || "n/a",
          amount: ada,
          currency: "ADA",
          wallet_address: tr,
          tx_hash: txHash,
          network: "preprod",
          note: `${donationContext} : CIP-30 Preprod${destination ? ` → ${destination}` : ""}`,
          ...relatedMeta,
        });
      } catch {
        /* ignore */
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setDonateError(`${t("onboarding.preprodTxError")} ${msg}`);
    } finally {
      setCryptoPreprodBusy(false);
    }
  };

  const mainnetQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(cardanoWalletAddress)}`;

  return (
    <div className={cn(className)}>
      {showTitle ? (
        <div className="flex items-center justify-center gap-3 mb-6 text-center">
          <HandCoins className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">{t("onboarding.donateTitle")}</h2>
        </div>
      ) : null}

      <div className="mb-5">
        <p className="mb-2 text-center text-sm font-bold text-[#0f2847] dark:text-white">
          {t("support.visibilityTitle")}
        </p>
        <p className="mb-3 text-center text-xs font-medium text-[#0f2847]/70 dark:text-slate-300">
          {t("support.visibilityHint")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setDonorVisibility("anonymous");
              setDonateError("");
            }}
            className={cn(
              "border px-3 py-3 text-sm font-bold transition-colors",
              donorVisibility === "anonymous"
                ? "border-[#ffb800] bg-[#ffb800] text-[#0f2847]"
                : "border-slate-200 bg-[#f7f8fa] text-[#0f2847] hover:border-[#ffb800] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            )}
          >
            {t("support.visibilityAnonymous")}
          </button>
          <button
            type="button"
            onClick={() => {
              setDonorVisibility("public");
              setDonateError("");
            }}
            className={cn(
              "border px-3 py-3 text-sm font-bold transition-colors",
              donorVisibility === "public"
                ? "border-[#ffb800] bg-[#ffb800] text-[#0f2847]"
                : "border-slate-200 bg-[#f7f8fa] text-[#0f2847] hover:border-[#ffb800] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            )}
          >
            {t("support.visibilityPublic")}
          </button>
        </div>
      </div>

      {donorVisibility === "public" ? (
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-foreground">{t("onboarding.mobileNameLabel")}</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder={t("onboarding.mobileNamePlaceholder")}
              className="w-full rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">{t("onboarding.mobileEmailLabel")} *</label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder={t("onboarding.mobileEmailPlaceholder")}
              className="w-full rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">{t("onboarding.mobilePhoneLabel")} *</label>
            <input
              type="tel"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder={t("onboarding.mobilePhonePlaceholder")}
              className="w-full rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <p className="sm:col-span-2 text-xs font-medium text-[#0f2847]/75 dark:text-slate-300">
            {t("support.visibilityPublicHint")}
          </p>
        </div>
      ) : null}

      {!donorVisibility ? (
        <p className="text-center text-sm font-semibold text-[#0f2847] dark:text-slate-200">
          {t("support.visibilityRequired")}
        </p>
      ) : (
        <>
      <div className="mb-7 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setDonateMethod("mobile")}
          className={cn(
            "flex items-center gap-3 border px-4 py-4 text-left transition-colors",
            donateMethod === "mobile"
              ? "border-[#ffb800] bg-[#ffb800] text-[#0f2847]"
              : "border-slate-200 bg-[#f7f8fa] text-[#0f2847] hover:border-[#ffb800]/70 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          )}
        >
          <Smartphone className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-sm font-bold">{t("onboarding.mobileMoneyButton")}</span>
        </button>
        <button
          type="button"
          onClick={() => setDonateMethod("crypto")}
          className={cn(
            "flex items-center gap-3 border px-4 py-4 text-left transition-colors",
            donateMethod === "crypto"
              ? "border-[#ffb800] bg-[#ffb800] text-[#0f2847]"
              : "border-slate-200 bg-[#f7f8fa] text-[#0f2847] hover:border-[#ffb800]/70 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          )}
        >
          <Wallet className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-sm font-bold">{t("onboarding.cryptoButton")}</span>
        </button>
      </div>

      {donateMethod === "mobile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 md:p-7 border border-border/70"
        >
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-primary shrink-0" />
            <h3 className="font-display text-lg font-semibold text-foreground">{t("onboarding.mobileNetworksTitle")}</h3>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200/90 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 mb-5">
            {t("onboarding.mobileRdcScope")}
          </p>

          {mobileSubview === "menu" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">{t("onboarding.mobileChoosePathTitle")}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMobileSubview("rdc-logos")}
                  className="flex flex-col items-start gap-3 rounded-xl border border-border bg-background/70 p-5 text-left transition hover:border-primary/50 hover:bg-secondary/40"
                >
                  <Smartphone className="h-8 w-8 text-primary" aria-hidden />
                  <span className="font-display text-base font-semibold text-foreground">{t("onboarding.mobilePathRdcTitle")}</span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{t("onboarding.mobilePathRdcDesc")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileSubview("flutterwave")}
                  className="flex flex-col items-start gap-3 rounded-xl border border-border bg-background/70 p-5 text-left transition hover:border-primary/50 hover:bg-secondary/40"
                >
                  <CreditCard className="h-8 w-8 text-primary" aria-hidden />
                  <span className="font-display text-base font-semibold text-foreground">{t("onboarding.mobilePathFlutterwaveTitle")}</span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{t("onboarding.mobilePathFlutterwaveDesc")}</span>
                </button>
              </div>
            </div>
          )}

          {mobileSubview === "rdc-logos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{t("onboarding.mobilePickNetworkTitle")}</p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileSubview("menu");
                    setRdcOperator(null);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {t("onboarding.mobileBack")}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {RDC_OPERATOR_IDS.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setRdcOperator(op);
                      setMobileSubview("rdc-form");
                    }}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background/80 p-4 transition hover:border-primary/60 hover:bg-secondary/50"
                  >
                    <div className="flex h-16 w-full items-center justify-center rounded-lg bg-secondary/50">
                      {!rdcLogoFailed[op] ? (
                        <img
                          src={RDC_OPERATOR_LOGOS[op]}
                          alt={t(`onboarding.mobile.${op}`)}
                          className="max-h-14 max-w-[90%] object-contain"
                          onError={() => setRdcLogoFailed((prev) => ({ ...prev, [op]: true }))}
                        />
                      ) : (
                        <span className="text-lg font-bold tracking-tight text-primary">{RDC_LOGO_FALLBACK[op]}</span>
                      )}
                    </div>
                    <span className="text-center text-xs font-medium text-foreground leading-tight">{t(`onboarding.mobile.${op}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mobileSubview === "rdc-form" && rdcOperator && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {t("onboarding.mobileRdcFormTitle")} : {t(`onboarding.mobile.${rdcOperator}`)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileSubview("rdc-logos");
                    setRdcOperator(null);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {t("onboarding.mobileBack")}
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t("onboarding.mobileRdcFormHint")}</p>
              <div>
                <label className="text-sm text-foreground/90 block mb-1.5">{t("onboarding.mobileAmountLabel")}</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder={t("onboarding.mobileAmountPlaceholder")}
                  className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleRdcMobileSubmit()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
                disabled={isSubmittingDonation}
              >
                {isSubmittingDonation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("onboarding.mobileDonateProcessing")}
                  </>
                ) : (
                  t("onboarding.mobileRdcSubmitCta")
                )}
              </button>
            </div>
          )}

          {mobileSubview === "flutterwave" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary shrink-0" aria-hidden />
                  <p className="text-sm font-semibold text-foreground">{t("onboarding.mobileFlutterwaveTitle")}</p>
                </div>
                <button type="button" onClick={() => setMobileSubview("menu")} className="text-sm text-primary hover:underline">
                  {t("onboarding.mobileBack")}
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t("onboarding.mobileFlutterwaveHint")}</p>
              <div>
                <label className="text-sm text-foreground/90 block mb-1.5">{t("onboarding.mobileAmountLabel")}</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder={t("onboarding.mobileAmountPlaceholder")}
                  className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="button"
                onClick={handleFlutterwaveDonate}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
                disabled={isSubmittingDonation}
              >
                {isSubmittingDonation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("onboarding.mobileDonateProcessing")}
                  </>
                ) : (
                  t("onboarding.mobileFlutterwaveCta")
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {donateMethod === "crypto" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="glass rounded-xl p-6 md:p-7 border border-border/70"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">{t("onboarding.cryptoTitle")}</h3>
          </div>
          <p className="text-foreground/80 mb-5">{t("onboarding.cryptoHow")}</p>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 md:p-5 mb-6">
            <div className="mb-3 inline-flex items-center rounded-md border border-primary/30 bg-background/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Preprod
            </div>
            <h4 className="font-display text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary shrink-0" aria-hidden />
              {t("onboarding.cryptoWalletFlowTitle")}
            </h4>
            <p className="text-xs text-foreground/75 mb-4 leading-relaxed">{t("onboarding.cryptoWalletFlowHint")}</p>

            {!cryptoPreprodTxHash && cryptoPayStep === "idle" ? (
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1 min-w-0">
                  <label className="text-sm text-foreground/90 mb-1.5 block">{t("onboarding.cryptoAdaLabel")}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cryptoAdaAmount}
                    onChange={(e) => setCryptoAdaAmount(e.target.value)}
                    placeholder={t("onboarding.cryptoAdaPlaceholder")}
                    className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCryptoPreprodContinue}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shrink-0"
                >
                  {t("onboarding.cryptoPayCta")}
                </button>
              </div>
            ) : null}

            {!cryptoPreprodTxHash && cryptoPayStep === "wallets" ? (
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  <span className="text-foreground/70">{t("onboarding.cryptoAdaLabel")}:</span>{" "}
                  <span className="font-semibold tabular-nums">{String(cryptoAdaAmount).replace(",", ".")} ADA</span>
                </p>
                <p className="text-sm font-medium text-foreground">{t("onboarding.cryptoWalletsTitle")}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {cipWallets.map((w) => (
                    <li key={w.id}>
                      <button
                        type="button"
                        onClick={() => void handlePreprodWalletSelect(w.id, w.name)}
                        disabled={cryptoPreprodBusy}
                        className="flex w-full items-center gap-3 rounded-lg border border-border bg-background/80 px-3 py-2.5 text-left transition hover:bg-secondary/60 disabled:opacity-50"
                      >
                        {w.icon ? (
                          <img src={w.icon} alt="" className="h-8 w-8 shrink-0 rounded-md object-contain" />
                        ) : (
                          <Wallet className="h-8 w-8 shrink-0 text-primary" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1 text-sm font-medium text-foreground truncate">{w.name}</span>
                        {cryptoPreprodBusy ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" /> : null}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setCryptoPayStep("idle");
                    setDonateError("");
                  }}
                  className="text-sm text-primary hover:underline underline-offset-2"
                >
                  {t("onboarding.cryptoBackAmount")}
                </button>
              </div>
            ) : null}

            {!cryptoPreprodTxHash && cryptoPayStep === "review" && cryptoSelectedWalletName ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">{t("onboarding.cryptoPreprodReviewTitle")}</p>
                <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
                  <li>{t("onboarding.cryptoPreprodReviewAmount", { ada: String(cryptoAdaAmount).replace(",", ".") })}</li>
                  <li>{t("onboarding.cryptoPreprodReviewWallet", { wallet: cryptoSelectedWalletName })}</li>
                </ul>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handlePreprodConfirmSign()}
                    disabled={cryptoPreprodBusy}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-60"
                  >
                    {cryptoPreprodBusy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("onboarding.cryptoPreprodSigning")}
                      </>
                    ) : (
                      t("onboarding.cryptoPreprodConfirmPay")
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      cryptoPreprodWalletRef.current = null;
                      setCryptoPayStep("wallets");
                      setDonateError("");
                    }}
                    disabled={cryptoPreprodBusy}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-secondary/50 disabled:opacity-50"
                  >
                    {t("onboarding.cryptoPreprodChangeWallet")}
                  </button>
                </div>
              </div>
            ) : null}

            {cryptoPreprodTxHash ? (
              <div className="rounded-lg border border-primary/30 bg-background/80 p-4 text-sm">
                <p className="font-medium text-foreground mb-2">{t("onboarding.preprodTxSuccess")}</p>
                <a
                  href={preprodTxExplorerUrl(cryptoPreprodTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {t("onboarding.preprodViewTx")}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setCryptoPreprodTxHash("");
                    setCryptoPayStep("idle");
                    setCryptoAdaAmount("");
                    setCryptoSelectedWalletName("");
                    setDonateSuccess("");
                  }}
                  className="mt-3 block text-sm text-primary hover:underline"
                >
                  {t("onboarding.cryptoBackAmount")}
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("onboarding.cryptoManualDivider")}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>

          <div className="rounded-lg border border-border bg-background/80 p-4 mb-2">
            <div className="mb-3 inline-flex items-center rounded-md border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
              Mainnet
            </div>
            <p className="text-xs font-medium text-foreground/80 mb-1">{t("onboarding.cryptoMainnetAddressLabel")}</p>
            <p className="text-xs text-foreground/70 mb-2">{t("onboarding.cryptoMainnetAddressNote")}</p>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <img
                src={mainnetQrUrl}
                alt="QR code adresse Cardano Mainnet"
                width={160}
                height={160}
                className="rounded-lg border border-border bg-white p-1 shrink-0"
              />
              <p className="text-sm text-foreground break-all">{cardanoWalletAddress}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              onClick={copyWalletAddress}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border bg-background/80 text-foreground hover:bg-secondary/70 transition-all duration-200"
            >
              {t("onboarding.cryptoCopyMainnetAddress")}
            </button>
            <a
              href={`https://cardanoscan.io/address/${cardanoWalletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border bg-background/80 text-foreground hover:bg-secondary/70 transition-all duration-200"
            >
              {t("onboarding.cryptoCardanoscanMainnet")}
            </a>
          </div>
          <button
            type="button"
            onClick={() => void handleCryptoIntent()}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmittingDonation}
          >
            {isSubmittingDonation ? "Traitement..." : t("onboarding.cryptoManualDoneCta")}
          </button>
          {cryptoConfirmed && (
            <p className="text-sm text-primary mt-3">{t("onboarding.cryptoManualThanks")}</p>
          )}
        </motion.div>
      )}

      {donateSuccess && <p className="text-sm text-primary mt-3 text-center">{donateSuccess}</p>}
      {donateError && <p className="text-sm text-destructive mt-3 text-center">{donateError}</p>}
        </>
      )}
    </div>
  );
};

export default DonatePanel;
