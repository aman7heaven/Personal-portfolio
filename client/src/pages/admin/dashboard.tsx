import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/admin/sidebar";
import SectionHeader from "@/components/admin/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortfolioInfo, Skill, Experience, Project, SocialLink } from "@shared/schema";
import { BarChart3, Award, Briefcase, Folder, Users, Mail } from "lucide-react";

export default function AdminDashboard() {
  // Fetch portfolio data
  const { data: portfolioInfo } = useQuery<PortfolioInfo>({ queryKey: ['/api/portfolio-info'] });
  const { data: skills = [] } = useQuery<Skill[]>({ queryKey: ['/api/skills'] });
  const { data: experiences = [] } = useQuery<Experience[]>({ queryKey: ['/api/experiences'] });
  const { data: projects = [] } = useQuery<Project[]>({ queryKey: ['/api/projects'] });
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({ queryKey: ['/api/social-links'] });
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <SectionHeader 
          title="Dashboard" 
          description="Overview of your portfolio content"
          icon={<BarChart3 className="h-6 w-6" />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* About Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">About Section</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioInfo?.name || "Not set"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {portfolioInfo ? "Profile information configured" : "Profile information not set"}
              </p>
              <div className="mt-4">
                <Link href="/admin/about">
                  <Button size="sm" variant="outline">Edit About Section</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Skills Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skills.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total skills in your portfolio
              </p>
              <div className="mt-4">
                <Link href="/admin/skills">
                  <Button size="sm" variant="outline">Manage Skills</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Experiences Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Work Experience</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{experiences.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Work experiences displayed
              </p>
              <div className="mt-4">
                <Link href="/admin/experience">
                  <Button size="sm" variant="outline">Manage Experience</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Projects Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Projects showcased
              </p>
              <div className="mt-4">
                <Link href="/admin/projects">
                  <Button size="sm" variant="outline">Manage Projects</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Social Links Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Social Links</CardTitle>
              <svg 
                className="h-4 w-4 text-muted-foreground" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{socialLinks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Social media profiles linked
              </p>
              <div className="mt-4">
                <Link href="/admin/about">
                  <Button size="sm" variant="outline">Manage Social Links</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium truncate">{portfolioInfo?.contactEmail || "Email not set"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contact email for messages
              </p>
              <div className="mt-4">
                <Link href="/admin/about">
                  <Button size="sm" variant="outline">Edit Contact Info</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full">Settings</Button>
            </Link>
            <Link href="/" target="_blank">
              <Button variant="outline" className="w-full">View Portfolio</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
