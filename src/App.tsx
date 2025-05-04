
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import Index from "./pages/Index";
import EventDetail from "./pages/events/EventDetail";
import RegisterEvent from "./pages/events/RegisterEvent";
import UserDashboard from "./pages/user/Dashboard";
import FeedbackForm from "./pages/events/FeedbackForm";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import CreateEvent from "./pages/admin/CreateEvent";
import EmployeeList from "./pages/admin/EmployeeList";
import AssignEmployee from "./pages/admin/AssignEmployee";

// Layout Components
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";

// Not Found Page
import NotFound from "./pages/NotFound";

// Auth Context Provider
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="events/:id/register" element={<RegisterEvent />} />
            </Route>
            
            {/* Protected User Routes */}
            <Route path="/user" element={<Layout />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="events/:id/feedback" element={<FeedbackForm />} />
            </Route>
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/assign" element={<AssignEmployee />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
