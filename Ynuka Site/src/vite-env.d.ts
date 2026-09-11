/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLOCKFROST_PREPROD_PROJECT_ID?: string;
  readonly VITE_CARDANO_DONATION_ADDRESS_PREPROD?: string;
  readonly VITE_GOMA_DREP_ID?: string;
  readonly VITE_GOMA_DREP_PROFILE_URL?: string;
  readonly VITE_GOMA_DREP_DELEGATE_URL?: string;
  readonly VITE_GOMA_DREP_COMMUNITY_URL?: string;
  readonly VITE_LUMA_EVENTS_URL?: string;
  readonly VITE_LUMA_CALENDAR_ID?: string;
  readonly VITE_FLUTTERWAVE_PUBLIC_KEY?: string;
  readonly VITE_CARDANO_DONATION_ADDRESS_MAINNET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
