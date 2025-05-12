
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

// Components
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";

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
            <Route path="/register" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Register />
              </RoleProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/register-person" element={
              <ProtectedRoute>
                <RegisterPerson />
              </ProtectedRoute>
            } />
            <Route path="/register-case" element={
              <ProtectedRoute>
                <RegisterCase />
              </ProtectedRoute>
            } />
            <Route path="/case/:caseId" element={
              <ProtectedRoute>
                <CaseDetails />
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <RoleProtectedRoute allowedRoles={['admin', 'social_assistance']}>
                <Alerts />
              </RoleProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            <Route path="/followups" element={
              <RoleProtectedRoute allowedRoles={['admin', 'social_assistance']}>
                <SocialFollowups />
              </RoleProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Settings />
              </RoleProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
