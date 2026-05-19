import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet } from "lucide-react";

interface WalletInfo {
  name: string;
  address: string;
  type: "evm" | "cardano";
}

const WalletConnect = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const connectMetaMask = async () => {
    setConnecting("metamask");
    try {
      const eth = (window as Window & { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
      if (!eth) { toast({ title: t("wallet.notInstalled", { wallet: "MetaMask" }), variant: "destructive" }); return; }
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts[0]) {
        setWallet({ name: "MetaMask", address: accounts[0], type: "evm" });
        toast({ title: t("wallet.connected", { wallet: "MetaMask" }) });
        setOpen(false);
      }
    } catch { toast({ title: t("wallet.error"), variant: "destructive" }); }
    finally { setConnecting(null); }
  };

  const connectCardano = async (walletKey: string, walletName: string) => {
    setConnecting(walletKey);
    try {
      const cardano = (window as Window & { cardano?: Record<string, { enable: () => Promise<{ getUsedAddresses: () => Promise<string[]>; getUnusedAddresses: () => Promise<string[]> }> }> }).cardano;
      if (!cardano || !cardano[walletKey]) {
        toast({ title: t("wallet.notInstalled", { wallet: walletName }), variant: "destructive" });
        return;
      }
      const api = await cardano[walletKey].enable();
      const addresses = await api.getUsedAddresses();
      const addr = addresses[0] || (await api.getUnusedAddresses())[0];
      if (addr) {
        const truncated = addr.slice(0, 12) + "..." + addr.slice(-8);
        setWallet({ name: walletName, address: truncated, type: "cardano" });
        toast({ title: t("wallet.connected", { wallet: walletName }) });
        setOpen(false);
      }
    } catch { toast({ title: t("wallet.error"), variant: "destructive" }); }
    finally { setConnecting(null); }
  };

  const disconnect = () => { setWallet(null); toast({ title: t("wallet.disconnected") }); };

  const wallets = [
    { key: "metamask", name: "MetaMask", icon: "🦊", action: connectMetaMask },
    { key: "lace", name: "Lace", icon: "💎", action: () => connectCardano("lace", "Lace") },
    { key: "yoroi", name: "Yoroi", icon: "🔷", action: () => connectCardano("yoroi", "Yoroi") },
    { key: "eternl", name: "Eternl", icon: "🌀", action: () => connectCardano("eternl", "Eternl") },
  ];

  if (wallet) {
    return (
      <div className="flex items-center gap-2">
        <div className="glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-medium">{wallet.name}</span>
          <span className="text-muted-foreground">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={disconnect} className="text-xs">{t("wallet.disconnect")}</Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline-glow" size="sm">
          <Wallet className="h-4 w-4 mr-1" /> {t("wallet.connect")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-card">
        <DialogHeader>
          <DialogTitle>{t("wallet.selectWallet")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {wallets.map((w) => (
            <button
              key={w.key}
              onClick={w.action}
              disabled={connecting !== null}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left disabled:opacity-50"
            >
              <span className="text-2xl">{w.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  {w.key === "metamask" ? "Ethereum / EVM" : "Cardano"}
                </p>
              </div>
              {connecting === w.key && <span className="text-xs text-muted-foreground">{t("wallet.connecting")}</span>}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnect;
