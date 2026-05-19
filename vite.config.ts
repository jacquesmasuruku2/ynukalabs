import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Configuration Vite personnalisée par Jacques MASURUKU pour GOMA HUB WEB3
// Optimisée pour le développement rapide avec HMR et build production
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ["crypto", "stream", "buffer", "process", "util", "events", "vm"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@sidan-lab/sidan-csl-rs-nodejs": path.resolve(__dirname, "node_modules/@sidan-lab/sidan-csl-rs-browser/sidan_csl_rs.js"),
    },
  },

  optimizeDeps: {
    include: [
      '@tanstack/react-query',
      'next-themes',
      'react/jsx-runtime'
    ],
    exclude: [
      '@meshsdk/core',
      '@meshsdk/core-cst',
      '@meshsdk/provider',
      '@cardano-sdk/core',
      '@sidan-lab/sidan-csl-rs-nodejs'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules\/.*/],
      transformMixedEsModules: true,
      ignoreTryCatch: 'remove'
    },
    rollupOptions: {
      external: [
        'axios',
        'rxjs',
        '@cardano-sdk/core',
        '@cardano-sdk/crypto',
        '@cardano-sdk/util',
        '@cardano-sdk/util-dev',
        '@cardano-sdk/key-management',
        '@cardano-sdk/dapp-connector',
        '@sidan-lab/sidan-csl-rs-nodejs',
        '@sidan-lab/sidan-csl-rs-browser',
        '@harmoniclabs/bytestring',
        '@harmoniclabs/cbor',
        '@harmoniclabs/crypto',
        '@harmoniclabs/pair',
        '@harmoniclabs/plutus-data',
        '@harmoniclabs/uplc',
        '@stricahq/bip32ed25519',
        '@stricahq/cbors',
        '@utxorpc/sdk',
        '@utxorpc/spec',
        '@meshsdk/common',
        '@meshsdk/core-cst'
      ],
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        dir: 'dist',
        format: 'es'
      }
    }
  }
}));
