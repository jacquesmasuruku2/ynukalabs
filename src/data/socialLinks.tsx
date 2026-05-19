import type { ComponentType } from "react";
import { IconDiscord, IconGitHub, IconTelegram, IconX } from "@/components/FooterSocialIcons";

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
    href: "#",
    ariaLabel: "Discord",
    Icon: IconDiscord,
    iconClassName: "bg-[#5865F2] text-white",
  },
  {
    href: "https://t.me/CardanoGomaCommunity",
    ariaLabel: "Telegram",
    Icon: IconTelegram,
    iconClassName: "bg-[#26A5E4] text-white",
  },
  {
    href: "#",
    ariaLabel: "GitHub",
    Icon: IconGitHub,
    iconClassName: "bg-[#24292F] text-white",
  },
];
