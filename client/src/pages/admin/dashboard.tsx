import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/admin/admin-layout";
import { ContactMessage, Experience, Project, Skill, SkillCategory, User } from "@shared/schema";
import { 
  Activity, 
  Briefcase, 
  Award, 
  Code, 
  Mail, 
  UserIcon, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Eye,
  PenLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  
  // Fetch user data directly
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  // Fetch dashboard stats
  const { data: experiences = [] } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });
  
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  const { data: skillCategories = [] } = useQuery<SkillCategory[]>({
    queryKey: ["/api/skill-categories"],
  });
  
  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });
  
  const { data: messages = [] } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact-messages"],
  });

  // Calculate unread messages count
  const unreadMessages = messages.filter(message => !message.read).length;

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-6 mx-auto w-full">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
            Welcome, {user?.username}!
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Manage and customize your portfolio website from this dashboard.
          </p>
        </div>

        <Separator className="my-6" />

        {/* Content Overview */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Content Overview
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Skills</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{skills.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">in {skillCategories.length} categories</p>
                  </div>
                  <Code className="h-8 w-8 text-blue-500 bg-blue-50 p-1.5 rounded-full" />
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 justify-start text-blue-500 text-sm" 
                  onClick={() => navigate("/admin/skills")}
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Manage Skills
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Experience</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{experiences.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">work experiences</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-amber-500 bg-amber-50 p-1.5 rounded-full" />
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 justify-start text-amber-500 text-sm" 
                  onClick={() => navigate("/admin/experience")}
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Manage Experience
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{projects.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">portfolio projects</p>
                  </div>
                  <Award className="h-8 w-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-full" />
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 justify-start text-emerald-500 text-sm" 
                  onClick={() => navigate("/admin/projects")}
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Manage Projects
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{messages.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {unreadMessages > 0 ? 
                        <span className="flex items-center">
                          <Badge variant="destructive" className="mr-1">{unreadMessages} new</Badge> 
                          messages
                        </span> : 
                        "contact messages"
                      }
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-rose-500 bg-rose-50 p-1.5 rounded-full" />
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 justify-start text-rose-500 text-sm" 
                  onClick={() => navigate("/admin/contact")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Messages */}
        {messages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Recent Messages
              {unreadMessages > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadMessages} new
                </Badge>
              )}
            </h2>
            
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {messages.slice(0, 3).map((message) => (
                    <div key={message.id} className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                      <div className={`rounded-full p-2 shrink-0 ${message.read ? 'bg-gray-100' : 'bg-primary/10'}`}>
                        <UserIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${message.read ? 'text-gray-500' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="font-semibold text-sm sm:text-base truncate">{message.name}</div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(message.createdAt).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">{message.email}</div>
                        <div className="text-xs sm:text-sm font-medium mt-1 truncate">{message.subject}</div>
                        <div className="text-xs sm:text-sm mt-1 line-clamp-2">{message.message}</div>
                      </div>
                      {!message.read && (
                        <Badge className="shrink-0" variant="secondary">New</Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="p-3 sm:p-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => navigate("/admin/contact")}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    View All Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow transition-shadow" 
              onClick={() => navigate("/admin/about")}
            >
              <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">About</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow transition-shadow" 
              onClick={() => navigate("/admin/skills")}
            >
              <Code className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Skills</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow transition-shadow" 
              onClick={() => navigate("/admin/experience")}
            >
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Experience</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow transition-shadow" 
              onClick={() => navigate("/admin/projects")}
            >
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Projects</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow transition-shadow" 
              onClick={() => navigate("/admin/contact")}
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Contact</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow transition-shadow" 
              onClick={() => navigate("/admin/settings")}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Settings</span>
            </Button>
            
            <Button 
              variant="default" 
              className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 col-span-2 sm:col-span-3 lg:col-span-6 shadow-sm hover:shadow-md transition-shadow" 
              onClick={() => navigate("/")}
            >
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">View Live Portfolio</span>
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
