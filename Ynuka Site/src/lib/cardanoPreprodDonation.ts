import type { IWallet } from "@meshsdk/common";

export type Cip30WalletEntry = {
  id: string;
  name: string;
  icon?: string;
};

export function listCip30Wallets(): Cip30WalletEntry[] {
  if (typeof window === "undefined") return [];
  const cardano = (window as Window & { cardano?: Record<string, { name?: string; icon?: string; enable?: () => Promise<unknown> }> })
    .cardano;
  if (!cardano) return [];
  const out: Cip30WalletEntry[] = [];
  for (const id of Object.keys(cardano)) {
    const w = cardano[id];
    if (typeof w?.enable === "function") {
      out.push({
        id,
        name: typeof w.name === "string" ? w.name : id,
        icon: typeof w.icon === "string" ? w.icon : undefined,
      });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export async function submitAdaDonationPreprod(params: {
  blockfrostProjectId: string;
  treasuryAddress: string;
  adaAmount: number;
  wallet: IWallet;
}): Promise<string> {
  const { BlockfrostProvider, Transaction } = await import("@meshsdk/core");
  const projectId = params.blockfrostProjectId.trim();
  const treasury = params.treasuryAddress.trim();
  if (!projectId) throw new Error("Blockfrost Preprod manquant.");
  if (!treasury.startsWith("addr_test1")) {
    throw new Error("L’adresse de réception testnet doit commencer par addr_test1.");
  }

  const fetcher = new BlockfrostProvider(projectId);
  const lam = BigInt(Math.floor(params.adaAmount * 1_000_000));
  if (lam <= 0n) throw new Error("Montant ADA invalide.");

  const unsigned = await new Transaction({
    initiator: params.wallet,
    fetcher,
    submitter: fetcher,
  })
    .sendLovelace(treasury, lam.toString())
    .setNetwork("preprod")
    .build();

  const signed = await params.wallet.signTx(unsigned, false);
  return params.wallet.submitTx(signed);
}

export function preprodTxExplorerUrl(txHash: string): string {
  return `https://preprod.cardanoscan.io/transaction/${txHash}`;
}
