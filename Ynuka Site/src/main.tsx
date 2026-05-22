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

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Failed to find element with id "root". Make sure index.html has <div id="root"></div>');
}

createRoot(rootElement).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <App />
  </ThemeProvider>
);
