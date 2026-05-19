import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StrapiAuthProvider } from "@/hooks/useStrapiAuth";
import { useStrapiAuth } from "@/hooks/useStrapiAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index-final";
import About from "./pages/About";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Projects from "./pages/Projects";
import Community from "./pages/Community";
import Resources from "./pages/Resources";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Partners from "./pages/Partners";
import Blockchains from "./pages/Blockchains";
import Contact from "./pages/Contact";
import Validators from "./pages/Validators";
import Documentation from "./pages/Documentation";
import Tools from "./pages/Tools";
import OnboardingProgram from "./pages/OnboardingProgram";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import LumaEvents from "./pages/LumaEvents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: ReactElement }) => {
  const { user, isAdmin, loading } = useStrapiAuth();

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StrapiAuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/luma-events" element={<LumaEvents />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/community" element={<Community />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/blockchains" element={<Blockchains />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/validators" element={<Validators />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/onboarding" element={<OnboardingProgram />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </StrapiAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
