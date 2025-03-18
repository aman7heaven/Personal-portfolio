import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { About } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema for about section
const aboutSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  additionalInfo: z.string().optional(),
  profileImage: z.string().url("Must be a valid URL").or(z.string().length(0)),
  details: z.array(
    z.object({
      icon: z.string(),
      label: z.string(),
      value: z.string()
    })
  ),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url("Must be a valid URL"),
      icon: z.string()
    })
  )
});

type AboutFormValues = z.infer<typeof aboutSchema>;

export default function AboutEdit() {
  const { toast } = useToast();
  
  // Fetch about data
  const { data: about, isLoading } = useQuery<About>({
    queryKey: ["/api/about"],
  });
  
  // Form setup
  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      bio: about?.bio || "",
      additionalInfo: about?.additionalInfo || "",
      profileImage: about?.profileImage || "",
      details: about?.details as any[] || [],
      socialLinks: about?.socialLinks as any[] || []
    },
    values: about as AboutFormValues,
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: AboutFormValues) => {
      const res = await apiRequest("PATCH", "/api/admin/about", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      toast({
        title: "About section updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: AboutFormValues) => {
    updateMutation.mutate(data);
  };

  // Helper functions to add/remove form array fields
  const addDetail = () => {
    const details = form.getValues("details") || [];
    form.setValue("details", [
      ...details,
      { icon: "info", label: "New Detail", value: "" }
    ]);
  };

  const removeDetail = (index: number) => {
    const details = form.getValues("details");
    form.setValue("details", details.filter((_, i) => i !== index));
  };

  const addSocialLink = () => {
    const socialLinks = form.getValues("socialLinks") || [];
    form.setValue("socialLinks", [
      ...socialLinks,
      { platform: "github", url: "https://", icon: "github" }
    ]);
  };

  const removeSocialLink = (index: number) => {
    const socialLinks = form.getValues("socialLinks");
    form.setValue("socialLinks", socialLinks.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit About Section</h1>
          <p className="text-gray-500">
            Update your personal information, details, and social links.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your bio and additional information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your professional bio" 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This is the main text displayed in your about section.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter additional information (optional)" 
                          className="min-h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Secondary paragraph displayed after your main bio.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/profile.jpg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The URL of your profile image. Leave empty to use default.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>
                  Your contact details displayed in the about section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {form.watch("details")?.map((_, index) => (
                  <div key={index} className="flex items-start gap-4 mb-4">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`details.${index}.icon`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Icon name (e.g., envelope, phone)" />
                            </FormControl>
                            <FormDescription>
                              FontAwesome icon name without the "fa-" prefix
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`details.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Label (e.g., Email, Phone)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`details.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Value (e.g., contact@example.com)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeDetail(index)}
                      className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={addDetail}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Detail
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Your social media profiles displayed in the about section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {form.watch("socialLinks")?.map((_, index) => (
                  <div key={index} className="flex items-start gap-4 mb-4">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.platform`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Platform name (e.g., github, twitter)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.icon`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Icon name (e.g., github, twitter)" />
                            </FormControl>
                            <FormDescription>
                              FontAwesome icon name without the "fa-" prefix
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://github.com/username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSocialLink(index)}
                      className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={addSocialLink}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="min-w-32"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
