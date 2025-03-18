import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/admin/sidebar";
import SectionHeader from "@/components/admin/section-header";
import { Loader2, User, Mail, Phone, MapPin, AtSign, PlusCircle, Trash2 } from "lucide-react";
import { insertPortfolioInfoSchema, insertSocialLinkSchema, PortfolioInfo, SocialLink } from "@shared/schema";

export default function AboutEditor() {
  const { toast } = useToast();
  
  // Fetch portfolio info and social links
  const { data: portfolioInfo, isLoading: isLoadingInfo } = useQuery<PortfolioInfo>({ 
    queryKey: ['/api/portfolio-info'] 
  });
  
  const { data: socialLinks = [], isLoading: isLoadingSocial } = useQuery<SocialLink[]>({ 
    queryKey: ['/api/social-links'] 
  });
  
  // Form state for portfolio info
  const [formData, setFormData] = useState({
    name: "",
    profileImage: "",
    heroTitle: "",
    heroSubtitle: "",
    aboutDescription: "",
    aboutAdditionalInfo: "",
    contactLocation: "",
    contactEmail: "",
    contactPhone: "",
    footerCopyright: ""
  });
  
  // New social link form
  const [newSocialLink, setNewSocialLink] = useState({
    platform: "",
    url: "",
    icon: ""
  });
  
  // Set initial form data when portfolio info is loaded
  useEffect(() => {
    if (portfolioInfo) {
      setFormData({
        name: portfolioInfo.name || "",
        profileImage: portfolioInfo.profileImage || "",
        heroTitle: portfolioInfo.heroTitle || "",
        heroSubtitle: portfolioInfo.heroSubtitle || "",
        aboutDescription: portfolioInfo.aboutDescription || "",
        aboutAdditionalInfo: portfolioInfo.aboutAdditionalInfo || "",
        contactLocation: portfolioInfo.contactLocation || "",
        contactEmail: portfolioInfo.contactEmail || "",
        contactPhone: portfolioInfo.contactPhone || "",
        footerCopyright: portfolioInfo.footerCopyright || ""
      });
    }
  }, [portfolioInfo]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle social link input changes
  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSocialLink(prev => ({ ...prev, [name]: value }));
  };
  
  // Save portfolio info mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const validatedData = insertPortfolioInfoSchema.parse(data);
      const res = await apiRequest("POST", "/api/portfolio-info", validatedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio-info'] });
      toast({
        title: "Changes saved",
        description: "Your portfolio information has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save changes",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Add social link mutation
  const addSocialLinkMutation = useMutation({
    mutationFn: async (data: typeof newSocialLink) => {
      const validatedData = insertSocialLinkSchema.parse(data);
      const res = await apiRequest("POST", "/api/social-links", validatedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-links'] });
      setNewSocialLink({ platform: "", url: "", icon: "" });
      toast({
        title: "Social link added",
        description: "Your social link has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add social link",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete social link mutation
  const deleteSocialLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/social-links/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-links'] });
      toast({
        title: "Social link deleted",
        description: "The social link has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete social link",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle portfolio info form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePortfolioMutation.mutate(formData);
  };
  
  // Handle social link form submission
  const handleAddSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    addSocialLinkMutation.mutate(newSocialLink);
  };
  
  // Handle social link deletion
  const handleDeleteSocialLink = (id: number) => {
    deleteSocialLinkMutation.mutate(id);
  };
  
  if (isLoadingInfo) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <SectionHeader 
          title="About & Personal Info" 
          description="Edit your personal information and about section"
          icon={<User className="h-6 w-6" />}
        />
        
        <Tabs defaultValue="personal" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="contact">Contact & Social</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="profileImage">Profile Image URL</Label>
                      <Input 
                        id="profileImage" 
                        name="profileImage" 
                        value={formData.profileImage} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aboutDescription">About Description</Label>
                    <Textarea 
                      id="aboutDescription" 
                      name="aboutDescription" 
                      value={formData.aboutDescription} 
                      onChange={handleInputChange} 
                      rows={4} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aboutAdditionalInfo">Additional Information</Label>
                    <Textarea 
                      id="aboutAdditionalInfo" 
                      name="aboutAdditionalInfo" 
                      value={formData.aboutAdditionalInfo} 
                      onChange={handleInputChange} 
                      rows={4} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="footerCopyright">Footer Copyright Text</Label>
                    <Input 
                      id="footerCopyright" 
                      name="footerCopyright" 
                      value={formData.footerCopyright} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="© 2023 Your Name. All rights reserved."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input 
                      id="heroTitle" 
                      name="heroTitle" 
                      value={formData.heroTitle} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Hi, I'm John Doe"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Input 
                      id="heroSubtitle" 
                      name="heroSubtitle" 
                      value={formData.heroSubtitle} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Full Stack Developer & UX Designer"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="contactEmail" 
                          name="contactEmail" 
                          value={formData.contactEmail} 
                          onChange={handleInputChange} 
                          required 
                          className="pl-10"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="contactPhone" 
                          name="contactPhone" 
                          value={formData.contactPhone} 
                          onChange={handleInputChange} 
                          className="pl-10"
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactLocation">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="contactLocation" 
                          name="contactLocation" 
                          value={formData.contactLocation} 
                          onChange={handleInputChange} 
                          className="pl-10"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddSocialLink} className="space-y-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="platform">Platform Name</Label>
                        <Input 
                          id="platform" 
                          name="platform" 
                          value={newSocialLink.platform} 
                          onChange={handleSocialLinkChange} 
                          required 
                          placeholder="GitHub"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="url" 
                            name="url" 
                            value={newSocialLink.url} 
                            onChange={handleSocialLinkChange} 
                            required 
                            className="pl-10"
                            placeholder="https://github.com/yourusername"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="icon">Icon (Remix Icon class)</Label>
                        <Input 
                          id="icon" 
                          name="icon" 
                          value={newSocialLink.icon} 
                          onChange={handleSocialLinkChange} 
                          required 
                          placeholder="ri-github-fill"
                        />
                        <p className="text-xs text-gray-500">
                          Use <a href="https://remixicon.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Remix Icon</a> class names (e.g., ri-github-fill, ri-linkedin-box-fill)
                        </p>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={addSocialLinkMutation.isPending}
                        className="w-full"
                      >
                        {addSocialLinkMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Social Link
                          </>
                        )}
                      </Button>
                    </form>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Current Social Links</h3>
                      
                      {isLoadingSocial ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : socialLinks.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No social links added yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {socialLinks.map(link => (
                            <div key={link.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                              <div className="flex items-center space-x-3">
                                <div className="bg-primary-100 text-primary-700 p-2 rounded-full">
                                  <i className={link.icon + " text-lg"}></i>
                                </div>
                                <div>
                                  <p className="font-medium">{link.platform}</p>
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-500 hover:text-primary"
                                  >
                                    {link.url}
                                  </a>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteSocialLink(link.id)}
                                disabled={deleteSocialLinkMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <div className="mt-6 flex justify-end">
              <Button 
                type="submit" 
                disabled={updatePortfolioMutation.isPending}
                size="lg"
              >
                {updatePortfolioMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
