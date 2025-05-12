
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import RegisterPerson from "@/pages/RegisterPerson";
import RegisterCase from "@/pages/RegisterCase";
import CaseDetails from "@/pages/CaseDetails";
import Alerts from "@/pages/Alerts";
import Search from "@/pages/Search";
import SocialFollowups from "@/pages/SocialFollowups";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register-person" element={<RegisterPerson />} />
            <Route path="/register-case" element={<RegisterCase />} />
            <Route path="/case/:caseId" element={<CaseDetails />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/search" element={<Search />} />
            <Route path="/followups" element={<SocialFollowups />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
