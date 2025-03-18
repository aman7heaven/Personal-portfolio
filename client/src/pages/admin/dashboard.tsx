import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/admin/admin-layout";
import { ContactMessage, Experience, Project, Skill, SkillCategory, User } from "@shared/schema";
import { Activity, Briefcase, Award, Code, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

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
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h1>
          <p className="text-gray-500">
            Manage and customize your portfolio website from this dashboard.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Experiences</CardTitle>
              <Briefcase className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{experiences.length}</div>
              <p className="text-xs text-gray-500 mt-1">Professional experiences</p>
              <Button 
                variant="link" 
                className="px-0 mt-2 h-auto" 
                onClick={() => navigate("/admin/experience")}
              >
                Manage Experiences →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Award className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-gray-500 mt-1">Portfolio projects</p>
              <Button 
                variant="link" 
                className="px-0 mt-2 h-auto" 
                onClick={() => navigate("/admin/projects")}
              >
                Manage Projects →
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              <Code className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skills.length}</div>
              <p className="text-xs text-gray-500 mt-1">Skills in {skillCategories.length} categories</p>
              <Button 
                variant="link" 
                className="px-0 mt-2 h-auto" 
                onClick={() => navigate("/admin/skills")}
              >
                Manage Skills →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Messages</h2>
            <Badge variant={unreadMessages > 0 ? "destructive" : "outline"}>
              {unreadMessages} unread
            </Badge>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {messages.length > 0 ? (
                <div className="divide-y">
                  {messages.slice(0, 5).map((message) => (
                    <div key={message.id} className="p-4 flex items-start gap-4">
                      <div className="bg-gray-100 rounded-full p-2">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{message.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{message.email}</div>
                        <div className="text-sm font-medium mt-1">{message.subject}</div>
                        <div className="text-sm mt-1 line-clamp-2">{message.message}</div>
                      </div>
                      {!message.read && (
                        <Badge className="shrink-0" variant="secondary">New</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No messages received yet
                </div>
              )}
              
              <div className="p-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/admin/contact")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  View All Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={() => navigate("/admin/about")}>Edit About Section</Button>
            <Button onClick={() => navigate("/admin/skills")}>Manage Skills</Button>
            <Button onClick={() => navigate("/admin/experience")}>Manage Experience</Button>
            <Button onClick={() => navigate("/admin/projects")}>Manage Projects</Button>
            <Button onClick={() => navigate("/admin/contact")}>Contact Settings</Button>
            <Button onClick={() => navigate("/admin/settings")}>Site Settings</Button>
            <Button variant="outline" onClick={() => navigate("/")}>View Portfolio</Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
