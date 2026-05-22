import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./i18n";
import "@fontsource/sn-pro/300.css";
import "@fontsource/sn-pro/400.css";
import "@fontsource/sn-pro/500.css";
import "@fontsource/sn-pro/600.css";
import "@fontsource/sn-pro/700.css";
import "@fontsource/sn-pro/800.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <App />
  </ThemeProvider>
);
