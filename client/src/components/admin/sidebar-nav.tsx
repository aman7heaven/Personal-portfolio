import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  User, 
  Code, 
  Briefcase, 
  FolderKanban, 
  Mail, 
  Settings 
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function SidebarNav() {
  const [location, navigate] = useLocation();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "About",
      href: "/admin/about",
      icon: <User className="h-5 w-5" />,
    },
    {
      title: "Skills",
      href: "/admin/skills",
      icon: <Code className="h-5 w-5" />,
    },
    {
      title: "Experience",
      href: "/admin/experience",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Projects",
      href: "/admin/projects",
      icon: <FolderKanban className="h-5 w-5" />,
    },
    {
      title: "Contact",
      href: "/admin/contact",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      title: "Site Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = location === item.href || 
                         (item.href !== "/admin" && location.startsWith(item.href));
        
        return (
          <div
            key={item.href}
            className={`flex items-center py-2 px-3 rounded-md cursor-pointer ${
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => navigate(item.href)}
          >
            <span className={`mr-3 ${isActive ? "text-primary" : "text-gray-500"}`}>
              {item.icon}
            </span>
            <span>{item.title}</span>
          </div>
        );
      })}
    </nav>
  );
}
