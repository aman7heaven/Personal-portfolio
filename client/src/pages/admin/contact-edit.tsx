import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ContactInfo, ContactMessage } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Mail, Eye, Check, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Form schema for contact info
const contactInfoSchema = z.object({
  description: z.string().optional(),
  email: z.string().email("Must be a valid email").or(z.string().length(0)),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url("Must be a valid URL"),
      icon: z.string()
    })
  )
});

type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

export default function ContactEdit() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("messages");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [newSocialLink, setNewSocialLink] = useState({ platform: "", url: "", icon: "" });
  
  // Fetch contact info
  const { data: contactInfo, isLoading: isContactInfoLoading } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  // Fetch contact messages
  const { data: messages = [], isLoading: isMessagesLoading, refetch: refetchMessages } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact-messages"],
  });

  // Sort messages by date (newest first)
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Contact form
  const form = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      description: contactInfo?.description || "",
      email: contactInfo?.email || "",
      phone: contactInfo?.phone || "",
      location: contactInfo?.location || "",
      socialLinks: contactInfo?.socialLinks as any[] || []
    },
    values: contactInfo as ContactInfoFormValues,
  });

  // Mutations
  const updateContactInfoMutation = useMutation({
    mutationFn: async (data: ContactInfoFormValues) => {
      const res = await apiRequest("PATCH", "/api/admin/contact-info", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-info"] });
      toast({
        title: "Contact information updated",
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

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/contact-messages/${id}/read`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      toast({
        title: "Message marked as read",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/contact-messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      setMessageDialogOpen(false);
      setSelectedMessage(null);
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: ContactInfoFormValues) => {
    updateContactInfoMutation.mutate(data);
  };

  // Handler to add social link
  const handleAddSocialLink = () => {
    if (!newSocialLink.platform || !newSocialLink.url || !newSocialLink.icon) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields for the social link",
        variant: "destructive",
      });
      return;
    }

    const socialLinks = form.getValues("socialLinks") || [];
    form.setValue("socialLinks", [...socialLinks, newSocialLink]);
    setNewSocialLink({ platform: "", url: "", icon: "" });
  };

  // Handler to remove social link
  const handleRemoveSocialLink = (index: number) => {
    const socialLinks = form.getValues("socialLinks");
    form.setValue("socialLinks", socialLinks.filter((_, i) => i !== index));
  };

  // Handler to view message
  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
    
    // Mark as read if it's unread
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  // Calculate unread count
  const unreadCount = messages.filter(message => !message.read).length;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contact Management</h1>
          <p className="text-gray-500">
            Manage contact messages and update your contact information.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="messages" className="relative">
              Messages
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contact-info">Contact Information</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Contact Messages</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchMessages()}
                disabled={isMessagesLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isMessagesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isMessagesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedMessages.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {sortedMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!message.read ? 'bg-blue-50/50' : ''}`}
                        onClick={() => handleViewMessage(message)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium flex items-center">
                            {message.name}
                            {!message.read && (
                              <Badge variant="secondary" className="ml-2">New</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString()} {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-1">{message.email}</div>
                        <div className="text-sm font-medium">{message.subject}</div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{message.message}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Mail className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-1">No messages received yet</p>
                  <p className="text-sm text-gray-400">Messages sent through your contact form will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contact-info">
            {isContactInfoLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Section</CardTitle>
                      <CardDescription>
                        Update the information displayed in your contact section.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Have a project in mind or just want to say hello? Feel free to reach out!" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              This text appears at the top of your contact section.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="contact@example.com" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              Contact email displayed to visitors. Also receives email notifications from contact form.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              Contact phone number (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="San Francisco, CA" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              Your location (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Social Links</CardTitle>
                      <CardDescription>
                        Manage social media links displayed in your contact section.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-2">Add New Social Link</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">Platform</label>
                            <Input 
                              placeholder="e.g., twitter" 
                              value={newSocialLink.platform}
                              onChange={(e) => setNewSocialLink({...newSocialLink, platform: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">Icon</label>
                            <Input 
                              placeholder="e.g., twitter" 
                              value={newSocialLink.icon}
                              onChange={(e) => setNewSocialLink({...newSocialLink, icon: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 mb-1 block">URL</label>
                            <Input 
                              placeholder="https://twitter.com/username" 
                              value={newSocialLink.url}
                              onChange={(e) => setNewSocialLink({...newSocialLink, url: e.target.value})}
                            />
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAddSocialLink}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Social Link
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Current Social Links</h3>
                        {form.watch("socialLinks")?.length > 0 ? (
                          <div className="divide-y">
                            {form.watch("socialLinks")?.map((link, index) => (
                              <div key={index} className="py-3 flex justify-between items-center">
                                <div>
                                  <div className="flex items-center">
                                    <i className={`fab fa-${link.icon} text-lg text-primary mr-2`}></i>
                                    <span className="font-medium">{link.platform}</span>
                                  </div>
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-sm text-gray-500 hover:underline"
                                  >
                                    {link.url}
                                  </a>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleRemoveSocialLink(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-md">
                            <p className="text-gray-500">No social links added yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="min-w-32"
                      disabled={updateContactInfoMutation.isPending}
                    >
                      {updateContactInfoMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </TabsContent>
        </Tabs>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="max-w-xl">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedMessage.subject}</DialogTitle>
                  <DialogDescription>
                    From: {selectedMessage.name} ({selectedMessage.email})
                  </DialogDescription>
                </DialogHeader>
                <div className="my-2">
                  <div className="text-xs text-gray-500 mb-4">
                    Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                  <div className="border rounded-md p-4 bg-gray-50 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <Button
                      variant="destructive"
                      onClick={() => deleteMessageMutation.mutate(selectedMessage.id)}
                      disabled={deleteMessageMutation.isPending}
                    >
                      {deleteMessageMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setMessageDialogOpen(false)}
                    >
                      Close
                    </Button>
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    >
                      <Button>
                        <Mail className="mr-2 h-4 w-4" />
                        Reply via Email
                      </Button>
                    </a>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
