"use client";
import { useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/context";
import {
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  PanelLeftIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import AdminDashboard from "./adminDashboard";
import StudentDashboard from "./studentDashboard";
import TeacherDashboard from "./teacherDashboard";

// Custom styles for profile tooltip
const profileStyles = `
  .profile-hover-container:hover .profile-tooltip {
    display: block;
  }
`;

function SidebarTrigger() {
  const { toggleSidebar, isMobile, state } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "z-50",
        isMobile ? "absolute left-4 top-4" : "transition-all duration-200"
      )}
      onClick={toggleSidebar}
    >
      {isMobile ? (
        <Menu className="h-5 w-5" />
      ) : (
        <PanelLeftIcon className="h-5 w-5" />
      )}
    </Button>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, setUser, loading, toggleLoading } = useAppContext();
  const getUserDetail = async () => {
    toggleLoading();
    const response = await axios.get("/api/users/me");
    setUser(response.data.data);
    toggleLoading();
  };
  useEffect(() => {
    getUserDetail();
  }, []);
  const logout = async () => {
    try {
      const response = await axios.post("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };
  return (
    <SidebarProvider defaultOpen>
      <div className="flex flex-row min-h-screen relative">
        <style dangerouslySetInnerHTML={{ __html: profileStyles }} />
        <SidebarTrigger />
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center justify-center"></div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarHeader className="border-t border-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="relative profile-hover-container">
                  <SidebarMenuButton className="profile-button">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </SidebarMenuButton>
                  {user && (
                    <div className="absolute bottom-full left-0 mb-2 z-50 hidden profile-tooltip">
                      <div className="flex flex-col gap-1 bg-popover text-popover-foreground rounded-md shadow-md p-3 min-w-[200px]">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>
                  )}
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="h-4 w-4 " />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
        </Sidebar>
        <main className="">
          {user?.role === "admin" && <AdminDashboard />}
          {user?.role === "teacher" && <TeacherDashboard />}
          {user?.role === "student" && <StudentDashboard />}
        </main>
      </div>
    </SidebarProvider>
  );
}
