
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import SolutionListPage from "@/pages/solutions/SolutionListPage";
import SolutionDetailPage from "@/pages/solutions/SolutionDetailPage";
import OpportunitiesPage from "@/pages/OpportunitiesPage";
import DiscoveryPage from "@/pages/DiscoveryPage";
import DiscoverySessionListPage from "@/pages/discovery/DiscoverySessionListPage";
import DiscoverySessionDetailPage from "@/pages/discovery/DiscoverySessionDetailPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="solutions" element={<SolutionListPage />} />
              <Route path="solutions/:id" element={<SolutionDetailPage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="discovery" element={<DiscoverySessionListPage />} />
              <Route path="discovery/:id" element={<DiscoverySessionDetailPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
