import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SiteConfig, Hero, InsertSiteConfig, InsertHero } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Info, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Form schemas
const siteConfigSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  primaryColor: z.string().min(1, "Primary color is required"),
  metaDescription: z.string().optional(),
});

const heroSchema = z.object({
  greeting: z.string().min(1, "Greeting is required"),
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
});

const setupKeySchema = z.object({
  setupKey: z.string().min(5, "Setup key must be at least 5 characters"),
});

type SiteConfigFormValues = z.infer<typeof siteConfigSchema>;
type HeroFormValues = z.infer<typeof heroSchema>;
type SetupKeyFormValues = z.infer<typeof setupKeySchema>;

export default function SiteSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Fetch site config
  const { data: siteConfig, isLoading: isSiteConfigLoading } = useQuery<SiteConfig>({
    queryKey: ["/api/site-config"],
  });

  // Fetch hero data
  const { data: heroData, isLoading: isHeroLoading } = useQuery<Hero>({
    queryKey: ["/api/hero"],
  });

  // Site config form
  const siteConfigForm = useForm<SiteConfigFormValues>({
    resolver: zodResolver(siteConfigSchema),
    defaultValues: {
      siteName: siteConfig?.siteName || "",
      primaryColor: siteConfig?.primaryColor || "",
      metaDescription: siteConfig?.metaDescription || "",
    },
    values: {
      siteName: siteConfig?.siteName || "",
      primaryColor: siteConfig?.primaryColor || "",
      metaDescription: siteConfig?.metaDescription || "",
    },
  });

  // Hero form
  const heroForm = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      greeting: heroData?.greeting || "",
      name: heroData?.name || "",
      tagline: heroData?.tagline || "",
    },
    values: {
      greeting: heroData?.greeting || "",
      name: heroData?.name || "",
      tagline: heroData?.tagline || "",
    },
  });

  // Setup key form
  const setupKeyForm = useForm<SetupKeyFormValues>({
    resolver: zodResolver(setupKeySchema),
    defaultValues: {
      setupKey: "",
    },
  });

  // Mutations
  const updateSiteConfigMutation = useMutation({
    mutationFn: async (data: InsertSiteConfig) => {
      const res = await apiRequest("PATCH", "/api/admin/site-config", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-config"] });
      toast({
        title: "Site settings updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update site settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateHeroMutation = useMutation({
    mutationFn: async (data: InsertHero) => {
      const res = await apiRequest("PATCH", "/api/admin/hero", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hero"] });
      toast({
        title: "Hero section updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update hero section",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSetupKeyMutation = useMutation({
    mutationFn: async (data: { setupKey: string }) => {
      const res = await apiRequest("PATCH", "/api/admin/site-config", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-config"] });
      toast({
        title: "Setup key updated",
        description: "Your setup key has been changed successfully.",
      });
      setupKeyForm.reset({ setupKey: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update setup key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onSiteConfigSubmit = (data: SiteConfigFormValues) => {
    updateSiteConfigMutation.mutate(data);
  };

  const onHeroSubmit = (data: HeroFormValues) => {
    updateHeroMutation.mutate(data);
  };

  const onSetupKeySubmit = (data: SetupKeyFormValues) => {
    updateSetupKeyMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
          <p className="text-gray-500">
            Configure global settings for your portfolio website.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {isSiteConfigLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...siteConfigForm}>
                <form onSubmit={siteConfigForm.handleSubmit(onSiteConfigSubmit)} className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>
                        Configure the basic settings for your portfolio website.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={siteConfigForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Portfolio" {...field} />
                            </FormControl>
                            <FormDescription>
                              This appears in the browser tab and in the navigation bar.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={siteConfigForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input placeholder="hsl(222.2 47.4% 11.2%)" {...field} />
                              </FormControl>
                              <div 
                                className="w-10 h-10 rounded-md border" 
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                            <FormDescription>
                              Enter a valid color value (HSL, HEX, or RGB). Example: hsl(222.2 47.4% 11.2%)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={siteConfigForm.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="A brief description of your portfolio website" 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              This is used for SEO and appears in search engine results.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="min-w-32"
                      disabled={updateSiteConfigMutation.isPending}
                    >
                      {updateSiteConfigMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="mr-2 h-4 w-4" />
                      )}
                      Update Settings
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </TabsContent>

          <TabsContent value="hero">
            {isHeroLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...heroForm}>
                <form onSubmit={heroForm.handleSubmit(onHeroSubmit)} className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero Section</CardTitle>
                      <CardDescription>
                        Configure the hero section of your portfolio.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={heroForm.control}
                        name="greeting"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Greeting</FormLabel>
                            <FormControl>
                              <Input placeholder="Hello, I'm" {...field} />
                            </FormControl>
                            <FormDescription>
                              This appears above your name in the hero section.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={heroForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your name as displayed in the hero section.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={heroForm.control}
                        name="tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tagline</FormLabel>
                            <FormControl>
                              <Input placeholder="Full Stack Developer & UI/UX Designer" {...field} />
                            </FormControl>
                            <FormDescription>
                              A brief description of your profession or specialty.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="min-w-32"
                      disabled={updateHeroMutation.isPending}
                    >
                      {updateHeroMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="mr-2 h-4 w-4" />
                      )}
                      Update Hero Section
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </TabsContent>

          <TabsContent value="security">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage security settings for your portfolio website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Setup Key Information</AlertTitle>
                  <AlertDescription>
                    The setup key is required when creating a new admin account. Keep it secret and only share with trusted individuals who need admin access.
                  </AlertDescription>
                </Alert>

                <Form {...setupKeyForm}>
                  <form onSubmit={setupKeyForm.handleSubmit(onSetupKeySubmit)} className="space-y-4">
                    <FormField
                      control={setupKeyForm.control}
                      name="setupKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Setup Key</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter a new setup key" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Must be at least 5 characters. Make it strong and unique.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateSetupKeyMutation.isPending}
                      >
                        {updateSetupKeyMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Update Setup Key
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
