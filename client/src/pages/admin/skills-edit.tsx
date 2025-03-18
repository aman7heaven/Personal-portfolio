import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SkillCategory, Skill, InsertSkillCategory, InsertSkill } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
});

const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.number({
    required_error: "Category is required",
    invalid_type_error: "Category must be a number",
  }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type SkillFormValues = z.infer<typeof skillSchema>;

export default function SkillsEdit() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("categories");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Fetch data
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<SkillCategory[]>({
    queryKey: ["/api/skill-categories"],
  });

  const { data: skills = [], isLoading: isSkillsLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  // Category form
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  // Skill form
  const skillForm = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      categoryId: undefined as unknown as number,
    },
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertSkillCategory) => {
      const res = await apiRequest("POST", "/api/admin/skill-categories", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skill-categories"] });
      setCategoryDialogOpen(false);
      categoryForm.reset();
      toast({
        title: "Category created",
        description: "Skill category has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertSkillCategory }) => {
      const res = await apiRequest("PATCH", `/api/admin/skill-categories/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skill-categories"] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
      toast({
        title: "Category updated",
        description: "Skill category has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/skill-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skill-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Category deleted",
        description: "Skill category has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: async (data: InsertSkill) => {
      const res = await apiRequest("POST", "/api/admin/skills", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setSkillDialogOpen(false);
      skillForm.reset();
      toast({
        title: "Skill created",
        description: "Skill has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create skill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertSkill }) => {
      const res = await apiRequest("PATCH", `/api/admin/skills/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setSkillDialogOpen(false);
      setEditingSkill(null);
      skillForm.reset();
      toast({
        title: "Skill updated",
        description: "Skill has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update skill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/skills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Skill deleted",
        description: "Skill has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete skill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const onCategorySubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const onSkillSubmit = (data: SkillFormValues) => {
    if (editingSkill) {
      updateSkillMutation.mutate({ id: editingSkill.id, data });
    } else {
      createSkillMutation.mutate(data);
    }
  };

  // Handler to open edit category dialog
  const handleEditCategory = (category: SkillCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      icon: category.icon,
    });
    setCategoryDialogOpen(true);
  };

  // Handler to open edit skill dialog
  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    skillForm.reset({
      name: skill.name,
      categoryId: skill.categoryId || 0,
    });
    setSkillDialogOpen(true);
  };

  // Handler to open new category dialog
  const handleNewCategory = () => {
    setEditingCategory(null);
    categoryForm.reset({ name: "", icon: "" });
    setCategoryDialogOpen(true);
  };

  // Handler to open new skill dialog
  const handleNewSkill = () => {
    setEditingSkill(null);
    skillForm.reset({ name: "", categoryId: categories[0]?.id });
    setSkillDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Skills</h1>
          <p className="text-gray-500">
            Add, edit, and remove skill categories and individual skills.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="categories">Skill Categories</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="mb-4 flex justify-end">
              <Button onClick={handleNewCategory}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            {isCategoriesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <i className={`fas fa-${category.icon} mr-2 text-primary`}></i>
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Icon: <code>{category.icon}</code>
                      </p>
                      <div className="mt-2">
                        <p className="text-sm">
                          {skills.filter(s => s.categoryId === category.id).length} skills in this category
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        {deleteCategoryMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-gray-500 mb-4">No skill categories added yet</p>
                  <Button onClick={handleNewCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Category
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="skills">
            <div className="mb-4 flex justify-end">
              <Button 
                onClick={handleNewSkill}
                disabled={categories.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </div>

            {categories.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-gray-500 mb-4">You need to create skill categories first</p>
                  <Button onClick={() => setActiveTab("categories")}>
                    Go to Categories
                  </Button>
                </CardContent>
              </Card>
            ) : isSkillsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div>
                {categories.map((category) => {
                  const categorySkills = skills.filter(
                    (skill) => skill.categoryId === category.id
                  );
                  
                  return (
                    <Card key={category.id} className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <i className={`fas fa-${category.icon} mr-2 text-primary`}></i>
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {categorySkills.length > 0 ? (
                          <ul className="divide-y">
                            {categorySkills.map((skill) => (
                              <li key={skill.id} className="py-3 flex justify-between items-center">
                                <span>{skill.name}</span>
                                <div className="space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSkill(skill)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => deleteSkillMutation.mutate(skill.id)}
                                    disabled={deleteSkillMutation.isPending}
                                  >
                                    {deleteSkillMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 mb-2">No skills in this category</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSkill(null);
                                skillForm.reset({ name: "", categoryId: category.id });
                                setSkillDialogOpen(true);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Skill to {category.name}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Category Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Edit your skill category details"
                  : "Create a new skill category"}
              </DialogDescription>
            </DialogHeader>
            <Form {...categoryForm}>
              <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                <FormField
                  control={categoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Frontend Development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={categoryForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., code, server, paint-brush" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a FontAwesome icon name without the "fa-" prefix
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCategoryDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createCategoryMutation.isPending || updateCategoryMutation.isPending
                    }
                  >
                    {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingCategory ? "Update Category" : "Save Category"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Skill Dialog */}
        <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSkill ? "Edit Skill" : "Add Skill"}</DialogTitle>
              <DialogDescription>
                {editingSkill ? "Edit your skill details" : "Add a new skill"}
              </DialogDescription>
            </DialogHeader>
            <Form {...skillForm}>
              <form onSubmit={skillForm.handleSubmit(onSkillSubmit)} className="space-y-4">
                <FormField
                  control={skillForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., JavaScript, React, Node.js" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={skillForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSkillDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                  >
                    {(createSkillMutation.isPending || updateSkillMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingSkill ? "Update Skill" : "Save Skill"}
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
