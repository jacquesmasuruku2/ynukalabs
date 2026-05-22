import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { strapiFetch } from "@/lib/strapi";
import {
  ArrowLeft,
  HeartHandshake,
  TrendingUp,
  HandCoins,
  Smartphone,
  Wallet,
  PlayCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import { listCip30Wallets, preprodTxExplorerUrl, submitAdaDonationPreprod } from "@/lib/cardanoPreprodDonation";
import type { IWallet } from "@meshsdk/common";
import { useCountUp } from "@/hooks/useCountUp";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const RDC_OPERATOR_IDS = ["orange", "airtel", "vodacom", "africel"] as const;
type RdcOperatorId = (typeof RDC_OPERATOR_IDS)[number];

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

const ImpactStat = ({ value, suffix, label }: { value: number; suffix?: string; label: string }) => {
  const { count, barProgress, elementRef } = useCountUp({ end: value, duration: 1800, startOnView: true });

  return (
    <div ref={elementRef} className="glass rounded-xl p-6 text-center">
      <p className="font-display text-4xl font-bold text-primary">
        {suffix ?? ""}
        {count}
      </p>
      <div
        className="mx-auto mt-3 h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full border border-primary/25 bg-primary/10"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 via-[#12B1A6] to-primary"
          style={{
            width: `${Math.max(0, Math.min(100, Math.round(barProgress * 100)))}%`,
            minWidth: barProgress > 0 ? "3px" : undefined,
          }}
        />
      </div>
      <p className="text-muted-foreground mt-3">{label}</p>
    </div>
  );
};

const OnboardingProgram = () => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [missingImages, setMissingImages] = useState<number[]>([]);
  const [donateMethod, setDonateMethod] = useState<"mobile" | "crypto" | null>(null);
  type MobileSubview = "menu" | "rdc-logos" | "rdc-form" | "flutterwave";
  const [mobileSubview, setMobileSubview] = useState<MobileSubview>("menu");
  const [rdcOperator, setRdcOperator] = useState<RdcOperatorId | null>(null);
  const [rdcLogoFailed, setRdcLogoFailed] = useState<Partial<Record<RdcOperatorId, boolean>>>({});
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
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

  const cipWallets = useMemo(() => (cryptoPayStep === "wallets" ? listCip30Wallets() : []), [cryptoPayStep]);

  const cardanoWalletAddress =
    "addr1qx9nr0z089h9pp8q6g4mr9zvjygp6s3rh03v2e05reyk7zlucfqrm58pch6tnppvp8yw58t6s9n0sxeeq5avqhdw6x5qn4vyzg";

  useEffect(() => {
    if (donateMethod === "mobile") {
      setMobileSubview("menu");
      setRdcOperator(null);
      setRdcLogoFailed({});
    }
  }, [donateMethod]);

  const validateMobileDonorFields = (amount: number) => {
    if (!donorName.trim()) return t("onboarding.mobileErrorName");
    if (!donorEmail.trim()) return t("onboarding.mobileErrorEmail");
    if (!donorPhone.trim()) return t("onboarding.mobileErrorPhone");
    if (!Number.isFinite(amount) || amount <= 0) return t("onboarding.mobileErrorAmount");
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
    checkout({
      public_key: flwPubKey,
      tx_ref: txRef,
      amount,
      currency: "USD",
      payment_options: "card,mobilemoney,ussd",
      customer: {
        email: donorEmail.trim(),
        phonenumber: donorPhone.trim(),
        name: donorName.trim(),
      },
      customizations: {
        title: "Ynuka Labs Donation",
        description: t("onboarding.mobileFlutterwaveCheckoutDesc"),
        logo: `${window.location.origin}/favicon.ico`,
      },
      meta: {
        donation_channel: "flutterwave",
        donation_context: "onboarding_program",
      },
      callback: async (response: unknown) => {
        try {
          const r = (response ?? {}) as { transaction_id?: string | number; tx_ref?: string };
          if (!r.transaction_id && !r.tx_ref) {
            setDonateError(t("onboarding.mobileFlutterwaveResponseError"));
            return;
          }
          setIsSubmittingDonation(true);
          const verify = await strapiFetch<{ ok?: boolean; status?: string }>("/api/donations/verify-flutterwave", {
            method: "POST",
            body: JSON.stringify({
              transaction_id: r.transaction_id,
              tx_ref: r.tx_ref,
              payer: {
                name: donorName.trim(),
                email: donorEmail.trim(),
                phone: donorPhone.trim(),
              },
            }),
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
      const res = await strapiFetch<{ ok?: boolean }>("/api/donations/rdc-mobile-intent", {
        method: "POST",
        body: JSON.stringify({
          donor_name: donorName.trim(),
          donor_email: donorEmail.trim(),
          donor_phone: donorPhone.trim(),
          amount,
          currency: "USD",
          operator: rdcOperator,
          note: `Onboarding — ${rdcOperator}`,
        }),
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
    try {
      setIsSubmittingDonation(true);
      const amount = Number(donationAmount || "0");
      const res = await strapiFetch<{ ok?: boolean }>("/api/donations/crypto-intent", {
        method: "POST",
        body: JSON.stringify({
          donor_name: donorName.trim(),
          donor_email: donorEmail.trim(),
          donor_phone: donorPhone.trim(),
          amount: Number.isFinite(amount) ? amount : 0,
          currency: "ADA",
          wallet_address: cardanoWalletAddress,
          note: "User clicked 'J'ai effectué le don' from onboarding page",
        }),
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
  const onboardingImages = [
    "/onboarding/onboarding-1.jpg",
    "/onboarding/onboarding-2.jpg",
    "/onboarding/onboarding-3.jpg",
    "/onboarding/onboarding-4.jpg",
    "/onboarding/onboarding-5.jpg",
    "/onboarding/onboarding-6.jpg",
  ];
  const testimonials = [
    {
      name: "Martin MUSAGARA.",
      photo: "/onboarding/testimonials/testimonial-1.png",
      videoUrl: "https://www.youtube.com/watch?v=AERCr9821Ig&t=11s",
    },
    {
      name: "Olivier M.",
      photo: "/onboarding/testimonials/testimonial-1.png",
      videoUrl: "https://www.youtube.com/watch?v=AERCr9821Ig&t=11s",
    },
    {
      name: "Olivier M.",
      photo: "/onboarding/testimonials/testimonial-1.png",
      videoUrl: "https://www.youtube.com/watch?v=AERCr9821Ig&t=11s",
    },
  ];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % onboardingImages.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [onboardingImages.length, isPaused]);

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
        await strapiFetch("/api/donations/crypto-intent", {
          method: "POST",
          body: JSON.stringify({
            donor_name: donorName.trim() || "Wallet Preprod",
            donor_email: donorEmail.trim() || "preprod@donation.local",
            donor_phone: donorPhone.trim() || "n/a",
            amount: ada,
            currency: "ADA",
            wallet_address: tr,
            tx_hash: txHash,
            network: "preprod",
            note: "Onboarding — CIP-30 Preprod",
          }),
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

  return (
    <div>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-start mb-6">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux projets
            </Link>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t("onboarding.title")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("onboarding.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 space-y-10">
          <motion.div
            id="what-is-onboarding"
            {...fadeUp}
            className="scroll-mt-28"
          >
            <div className="flex items-center justify-center gap-3 mb-6 text-center">
              <HeartHandshake className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold">{t("onboarding.whatTitle")}</h2>
            </div>
            <div
              className="min-h-[520px] lg:min-h-[620px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="grid h-full grid-cols-1 lg:grid-cols-2 lg:gap-4">
                {/* Image (gauche) */}
                <div className="relative min-h-[360px] lg:min-h-0 overflow-hidden rounded-2xl border border-border">
                  <AnimatePresence mode="wait">
                    {missingImages.includes(currentImageIndex) ? (
                      <motion.div
                        key={`placeholder-${currentImageIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground text-center px-4 bg-secondary/40"
                      >
                        Ajoute une image ici:{" "}
                        <code>/public/onboarding/onboarding-{currentImageIndex + 1}.jpg</code>
                      </motion.div>
                    ) : (
                      <motion.img
                        key={`bg-${currentImageIndex}`}
                        src={onboardingImages[currentImageIndex]}
                        alt={`Onboarding background ${currentImageIndex + 1}`}
                        onError={() =>
                          setMissingImages((prev) =>
                            prev.includes(currentImageIndex) ? prev : [...prev, currentImageIndex]
                          )
                        }
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.03 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </AnimatePresence>

                  {/* Légère ombre pour la lisibilité côté gauche */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
                </div>

                {/* Texte (droite) */}
                <div className="flex items-center justify-end p-5 md:p-6 lg:p-4">
                  <div className="max-w-md py-1 px-1 md:py-2 md:px-2">
                    <h3 className="font-display text-xl md:text-2xl font-bold mb-3 text-left text-foreground">
                      Web3 Onboarding Program
                    </h3>
                    <p
                      className="font-display leading-relaxed text-justify text-sm md:text-base lg:text-lg font-medium text-foreground"
                    >
                      Since 2023, Ynuka Labs identified a strong need for Web3 education, especially around the Cardano blockchain.
                      This led us to launch this program, through which at the end of each month we mobilize our limited resources and
                      recruit young entrepreneurs, students, and technology enthusiasts to provide a one-week training on topics such as Web3,
                      distributed ledger technology, blockchain, Cardano wallets, and other practical foundations for their journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            id="impact"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="glass rounded-xl p-8 scroll-mt-28"
          >
            <div className="flex items-center justify-center gap-3 mb-6 text-center">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold">{t("onboarding.impactTitle")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ImpactStat value={20} suffix="+" label={t("onboarding.stats.cohorts")} />
              <ImpactStat value={400} suffix="+" label={t("onboarding.stats.trained")} />
              <ImpactStat value={20} suffix="+" label={t("onboarding.stats.resources")} />
              <ImpactStat value={1} label={t("onboarding.stats.hub")} />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-secondary/20 p-6 md:p-7">
              <h3 className="font-display text-xl font-semibold mb-2 text-center">
                {t("onboarding.testimonials.title")}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {t("onboarding.testimonials.subtitle")}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((item, idx) => {
                  const isNamePlaceholder = item.name.startsWith("TO_ADD_");
                  const isVideoPlaceholder = item.videoUrl.startsWith("TO_ADD_");

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/70 bg-background/60 p-4"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-secondary/40 mb-3 flex items-center justify-center text-xs text-muted-foreground text-center px-2">
                        <img
                          src={item.photo}
                          alt={isNamePlaceholder ? t("onboarding.testimonials.photoPlaceholder") : item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const fallback = target.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <div style={{ display: "none" }}>
                          {t("onboarding.testimonials.photoPlaceholder")}
                        </div>
                      </div>

                      <p className="font-medium text-foreground text-center mb-3">
                        {isNamePlaceholder ? t("onboarding.testimonials.namePlaceholder") : item.name}
                      </p>

                      {isVideoPlaceholder ? (
                        <div className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm">
                          <PlayCircle className="h-4 w-4" />
                          {t("onboarding.testimonials.videoPlaceholder")}
                        </div>
                      ) : (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm"
                        >
                          <PlayCircle className="h-4 w-4" />
                          {t("onboarding.testimonials.watchVideo")}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            id="donate"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.16 }}
            className="glass rounded-xl p-8 scroll-mt-28"
          >
            <div className="flex items-center justify-center gap-3 mb-6 text-center">
              <HandCoins className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold">{t("onboarding.donateTitle")}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 text-justify">
              {t("onboarding.donateJustification")}
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setDonateMethod("mobile")}
                className={`px-4 py-2 rounded-lg border transition ${
                  donateMethod === "mobile"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/30 border-border hover:bg-secondary/60"
                }`}
              >
                {t("onboarding.mobileMoneyButton")}
              </button>
              <button
                type="button"
                onClick={() => setDonateMethod("crypto")}
                className={`px-4 py-2 rounded-lg border transition ${
                  donateMethod === "crypto"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/30 border-border hover:bg-secondary/60"
                }`}
              >
                {t("onboarding.cryptoButton")}
              </button>
            </div>

            {donateMethod === "mobile" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 md:p-7 border border-border/70 shadow-sm"
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
                        {t("onboarding.mobileRdcFormTitle")} — {t(`onboarding.mobile.${rdcOperator}`)}
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
                    <div className="grid md:grid-cols-2 gap-4">
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
                      <div>
                        <label className="text-sm text-foreground/90 block mb-1.5">{t("onboarding.mobileNameLabel")}</label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder={t("onboarding.mobileNamePlaceholder")}
                          className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/90 block mb-1.5">{t("onboarding.mobileEmailLabel")}</label>
                        <input
                          type="email"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          placeholder={t("onboarding.mobileEmailPlaceholder")}
                          className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/90 block mb-1.5">{t("onboarding.mobilePhoneLabel")}</label>
                        <input
                          type="tel"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          placeholder={t("onboarding.mobilePhonePlaceholder")}
                          className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
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
                    <div className="grid md:grid-cols-2 gap-4">
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
                      <div>
                        <label className="text-sm text-foreground/90 block mb-1.5">{t("onboarding.mobileNameLabel")}</label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder={t("onboarding.mobileNamePlaceholder")}
                          className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/90 block mb-1.5">{t("onboarding.mobileEmailLabel")}</label>
                        <input
                          type="email"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          placeholder={t("onboarding.mobileEmailPlaceholder")}
                          className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/90 block mb-1.5">{t("onboarding.mobilePhoneLabel")}</label>
                        <input
                          type="tel"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          placeholder={t("onboarding.mobilePhonePlaceholder")}
                          className="w-full px-4 py-3 rounded-lg bg-background/80 border border-border text-foreground placeholder:text-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
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
                className="glass rounded-xl p-6 md:p-7 border border-border/70 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">{t("onboarding.cryptoTitle")}</h3>
                </div>
                <p className="text-foreground/80 mb-5">
                  {t("onboarding.cryptoHow")}
                </p>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 md:p-5 mb-6">
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
                  <p className="text-xs font-medium text-foreground/80 mb-1">{t("onboarding.cryptoMainnetAddressLabel")}</p>
                  <p className="text-xs text-foreground/70 mb-2">{t("onboarding.cryptoMainnetAddressNote")}</p>
                  <p className="text-sm text-foreground break-all">{cardanoWalletAddress}</p>
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
                  onClick={handleCryptoIntent}
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
            {donateSuccess && (
              <p className="text-sm text-primary mt-3 text-center">{donateSuccess}</p>
            )}
            {donateError && (
              <p className="text-sm text-destructive mt-3 text-center">{donateError}</p>
            )}

            <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary/40 to-secondary/20 p-6 md:p-7 mt-6 shadow-sm">
              <h3 className="font-display text-xl font-semibold mb-2 text-center">
                {t("onboarding.ideaTitle")}
              </h3>
              <p className="text-muted-foreground mb-5 text-center leading-relaxed">
                {t("onboarding.ideaDesc")}
              </p>
              <div className="flex justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                >
                  {t("onboarding.ideaCta")}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OnboardingProgram;

