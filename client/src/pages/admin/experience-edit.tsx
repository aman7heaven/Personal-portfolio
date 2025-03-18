import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Experience, InsertExperience } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Form schema
const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().min(1, "Job type is required"),
  technologies: z.array(z.string()).optional(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function ExperienceEdit() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [newTechnology, setNewTechnology] = useState("");
  
  // Fetch data
  const { data: experiences = [], isLoading } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  // Sort experiences by start date (most recent first)
  const sortedExperiences = [...experiences].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Experience form
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      type: "Full-time",
      technologies: [],
    },
  });

  // Mutations
  const createExperienceMutation = useMutation({
    mutationFn: async (data: InsertExperience) => {
      const res = await apiRequest("POST", "/api/admin/experiences", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Experience created",
        description: "Experience has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertExperience }) => {
      const res = await apiRequest("PATCH", `/api/admin/experiences/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      setDialogOpen(false);
      setEditingExperience(null);
      form.reset();
      toast({
        title: "Experience updated",
        description: "Experience has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/experiences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      toast({
        title: "Experience deleted",
        description: "Experience has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const onSubmit = (data: ExperienceFormValues) => {
    if (editingExperience) {
      updateExperienceMutation.mutate({ id: editingExperience.id, data });
    } else {
      createExperienceMutation.mutate(data);
    }
  };

  // Handler to add a technology
  const handleAddTechnology = () => {
    if (newTechnology.trim() === "") return;
    
    const currentTechs = form.getValues("technologies") || [];
    if (!currentTechs.includes(newTechnology.trim())) {
      form.setValue("technologies", [...currentTechs, newTechnology.trim()]);
      setNewTechnology("");
    }
  };

  // Handler to remove a technology
  const handleRemoveTechnology = (tech: string) => {
    const currentTechs = form.getValues("technologies") || [];
    form.setValue(
      "technologies",
      currentTechs.filter((t) => t !== tech)
    );
  };

  // Handler to open edit dialog
  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    form.reset({
      title: experience.title,
      company: experience.company,
      location: experience.location,
      startDate: experience.startDate,
      endDate: experience.endDate || "",
      description: experience.description,
      type: experience.type,
      technologies: experience.technologies || [],
    });
    setDialogOpen(true);
  };

  // Handler to open new experience dialog
  const handleNew = () => {
    setEditingExperience(null);
    form.reset({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      type: "Full-time",
      technologies: [],
    });
    setDialogOpen(true);
  };

  // Toggle expanded state
  const toggleExpanded = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Experience</h1>
          <p className="text-gray-500">
            Add, edit, and remove your professional experience.
          </p>
        </div>

        <div className="mb-4 flex justify-end">
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedExperiences.length > 0 ? (
          <div className="space-y-4">
            {sortedExperiences.map((experience) => {
              const isItemExpanded = expanded === experience.id;
              
              return (
                <Card key={experience.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {experience.title}
                          <Badge className="ml-2" variant="outline">{experience.type}</Badge>
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1 space-y-1 sm:space-y-0 sm:space-x-4">
                          <div className="flex items-center">
                            <i className="fas fa-building mr-1"></i> {experience.company}
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-map-marker-alt mr-1"></i> {experience.location}
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-calendar mr-1"></i> {experience.startDate} - {experience.endDate || 'Present'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(experience.id)}
                      >
                        {isItemExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {isItemExpanded && (
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Description</h4>
                        <p className="text-sm text-gray-600">{experience.description}</p>
                      </div>
                      {experience.technologies && experience.technologies.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1">Technologies</h4>
                          <div className="flex flex-wrap gap-2">
                            {experience.technologies.map((tech, idx) => (
                              <Badge key={idx} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(experience)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteExperienceMutation.mutate(experience.id)}
                          disabled={deleteExperienceMutation.isPending}
                        >
                          {deleteExperienceMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-500 mb-4">No experiences added yet</p>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Experience
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Experience Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? "Edit Experience" : "Add Experience"}
              </DialogTitle>
              <DialogDescription>
                {editingExperience
                  ? "Edit your professional experience details"
                  : "Add a new professional experience"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Senior Frontend Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Tech Innovations Inc." {...field} />
                        </FormControl>
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
                          <Input placeholder="e.g., San Francisco, CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Full-time, Part-time, Contract" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., May, 2019" {...field} />
                        </FormControl>
                        <FormDescription>
                          Format as Month, Year (e.g., January 2020)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., June, 2021 (or leave blank for present)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank if this is your current job
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your responsibilities and achievements in this role" 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <label className="text-sm font-medium">Technologies Used</label>
                  <div className="flex mt-2 mb-1">
                    <Input
                      placeholder="e.g., React, Node.js"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      className="mr-2"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTechnology}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("technologies")?.map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center">
                        {tech}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => handleRemoveTechnology(tech)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createExperienceMutation.isPending || updateExperienceMutation.isPending
                    }
                  >
                    {(createExperienceMutation.isPending || updateExperienceMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingExperience ? "Update Experience" : "Save Experience"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
