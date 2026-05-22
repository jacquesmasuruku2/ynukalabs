export default {
  routes: [
    {
      method: "POST",
      path: "/donations/verify-flutterwave",
      handler: "donation.verifyFlutterwave",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/donations/flutterwave/webhook",
      handler: "donation.flutterwaveWebhook",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/donations/crypto-intent",
      handler: "donation.cryptoIntent",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/donations/rdc-mobile-intent",
      handler: "donation.rdcMobileIntent",
      config: {
        auth: false,
      },
    },
  ],
};
