import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Preloader from "./Preloader";
import PresenceTracker from "./PresenceTracker";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import { useSubpageScrollReveal } from "@/hooks/useSubpageScrollReveal";
import { cn } from "@/lib/utils";

import CursorRingField from "./ui/CursorRingField";

const Layout = ({ children }: { children: ReactNode }) => {
  const { isLoading, handlePreloaderComplete } = useGlobalLoader();
  const { pathname } = useLocation();
  useSubpageScrollReveal();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-[#0f2847] text-foreground transition-colors duration-300 dark:bg-background relative">
      <div className="fixed inset-0 z-[-1] opacity-80 pointer-events-none">
        <CursorRingField 
          background="#0f2847" 
          colors={["#ffb800", "#00e7df", "#a855f7"]} 
          density={250}
        />
      </div>
      <PresenceTracker />
      <Preloader onComplete={handlePreloaderComplete} />
      <Navbar />
      <main className={cn("flex-1 relative z-10", !isHome && "site-inner-pages pt-[120px] lg:pt-[140px]")}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
