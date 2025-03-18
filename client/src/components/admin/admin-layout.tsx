import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import SidebarNav from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use direct query for user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ensure the user is admin, redirect otherwise
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else if (!user.isAdmin) {
      toast({
        title: "Access denied",
        description: "You need admin privileges to access this area",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden bg-gray-600/75 ${
          sidebarOpen ? "" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-bold text-primary">Admin Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100%-64px)] justify-between">
          <div className="p-4">
            <SidebarNav />
          </div>
          <div className="p-4 border-t">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white border-b z-10 py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="font-medium"
            >
              View Site
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex font-medium"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
