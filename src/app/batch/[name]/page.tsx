"use client";
import { useEffect, useState } from "react";
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
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import AdminBatchPage from "./adminBatchPage";
import StudentBatchPage from "./studentBatchPage";
import TeacherBatchPage from "./teacherBatchPage";
import Link from "next/link";
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

export default function BatchPage() {
  const router = useRouter();
  const { user, setUser } = useAppContext();
  const params = useParams();
  const batchName = params.name as string;
  const resolvedParams = { name: batchName };
  const logout = async () => {
    try {
      const response = await axios.post("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };
  const getUser = async () => {
    try {
      const response = await axios.get("/api/users/me");
      setUser(response.data.data);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  return (
    <SidebarProvider defaultOpen>
      <div className="flex flex-row min-h-screen relative">
        <SidebarTrigger />
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center justify-center"></div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive
                  onClick={() => router.push("/dashboard")}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarHeader className="border-t border-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
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
          {user?.role === "admin" && <AdminBatchPage params={resolvedParams} />}
          {user?.role === "teacher" && (
            <TeacherBatchPage params={resolvedParams} />
          )}
          {user?.role === "student" && (
            <StudentBatchPage params={resolvedParams} />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
