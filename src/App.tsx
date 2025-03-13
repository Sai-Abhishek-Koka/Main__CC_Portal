
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Features from "./pages/Features";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminRequests from "./pages/admin/Requests";
import AdminIssues from "./pages/admin/Issues";
import AdminServers from "./pages/admin/Servers";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import UserRequests from "./pages/user/Requests";
import UserIssues from "./pages/user/Issues";
import UserServers from "./pages/user/Servers";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: "admin" | "user" | "both";
}) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole === "both" || userRole === allowedRole) {
    return <>{children}</>;
  }
  
  return <Navigate to="/login" replace />;
};

// App Routing Logic
const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<GetStarted />} />
    <Route path="/login" element={<Login />} />
    <Route path="/index" element={<Index />} />
    <Route path="/about" element={<About />} />
    <Route path="/features" element={<Features />} />
    
    {/* Admin Routes */}
    <Route 
      path="/admin/dashboard" 
      element={
        <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/admin/users" 
      element={
        <ProtectedRoute allowedRole="admin">
          <AdminUsers />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/admin/requests" 
      element={
        <ProtectedRoute allowedRole="admin">
          <AdminRequests />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/admin/issues" 
      element={
        <ProtectedRoute allowedRole="admin">
          <AdminIssues />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/admin/servers" 
      element={
        <ProtectedRoute allowedRole="admin">
          <AdminServers />
        </ProtectedRoute>
      } 
    />
    
    {/* User Routes */}
    <Route 
      path="/user/dashboard" 
      element={
        <ProtectedRoute allowedRole="user">
          <UserDashboard />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/user/requests" 
      element={
        <ProtectedRoute allowedRole="user">
          <UserRequests />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/user/issues" 
      element={
        <ProtectedRoute allowedRole="user">
          <UserIssues />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/user/servers" 
      element={
        <ProtectedRoute allowedRole="user">
          <UserServers />
        </ProtectedRoute>
      } 
    />
    
    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
