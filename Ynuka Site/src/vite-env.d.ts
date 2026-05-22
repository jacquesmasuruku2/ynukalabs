/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLOCKFROST_PREPROD_PROJECT_ID?: string;
  readonly VITE_CARDANO_DONATION_ADDRESS_PREPROD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
