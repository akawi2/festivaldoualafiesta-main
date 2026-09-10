import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Mediatheque from "./pages/Mediatheque";
import MissElection from "./pages/MissElection";
// Rubrique retirée pour le moment (demande du 2026-09-10).
// import HerosKwatt from "./pages/HerosKwatt";
import Programme from "./pages/Programme";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mediatheque" element={<Mediatheque />} />
            <Route path="/miss-election" element={<MissElection />} />
            {/* Rubrique retirée pour le moment (demande du 2026-09-10). */}
            {/* <Route path="/heros-kwatt" element={<HerosKwatt />} /> */}
            <Route path="/programme" element={<Programme />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
