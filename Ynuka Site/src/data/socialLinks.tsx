import type { ComponentType } from "react";
import { IconTelegram, IconX } from "@/components/FooterSocialIcons";

export type SocialLinkItem = {
  href: string;
  ariaLabel: string;
  Icon: ComponentType<{ className?: string }>;
  iconClassName: string;
};

/** Mêmes URLs et icônes que le footer — réseaux Ynuka Labs */
export const socialLinks: SocialLinkItem[] = [
  {
    href: "https://x.com/StakeGoma",
    ariaLabel: "X",
    Icon: IconX,
    iconClassName: "bg-[#000000] text-white ring-1 ring-black/10",
  },
  {
    href: "https://t.me/CardanoGomaCommunity",
    ariaLabel: "Telegram",
    Icon: IconTelegram,
    iconClassName: "bg-[#26A5E4] text-white",
  },
];
