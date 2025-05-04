
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { Calendar, Users, Plus, Settings, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarHeader className="p-4">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/dashboard">
                  <Settings size={20} />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/events/create">
                  <Plus size={20} />
                  <span>Create Event</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/employees">
                  <Users size={20} />
                  <span>Employees</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/admin/employees/assign">
                  <Calendar size={20} />
                  <span>Assign Employees</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="mr-2" size={16} />
            Back to Events
          </Link>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
