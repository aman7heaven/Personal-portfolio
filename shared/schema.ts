import { pgTable, text, serial, integer, boolean, varchar, json, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

// Site configuration
export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Portfolio"),
  setupKey: text("setup_key").notNull(),
  primaryColor: text("primary_color").notNull().default("hsl(222.2 47.4% 11.2%)"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteConfigSchema = createInsertSchema(siteConfig).pick({
  siteName: true,
  setupKey: true,
  primaryColor: true,
  metaDescription: true,
});

// Hero section
export const hero = pgTable("hero", {
  id: serial("id").primaryKey(),
  greeting: text("greeting").notNull().default("Hello, I'm"),
  name: text("name").notNull().default("John Doe"),
  tagline: text("tagline").notNull().default("Full Stack Developer & UI/UX Designer"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHeroSchema = createInsertSchema(hero).pick({
  greeting: true,
  name: true,
  tagline: true,
});

// About section
export const about = pgTable("about", {
  id: serial("id").primaryKey(),
  bio: text("bio").notNull().default("I'm a passionate developer with experience building web applications."),
  additionalInfo: text("additional_info"),
  profileImage: text("profile_image"),
  details: jsonb("details"),
  socialLinks: jsonb("social_links"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAboutSchema = createInsertSchema(about).pick({
  bio: true,
  additionalInfo: true,
  profileImage: true,
  details: true,
  socialLinks: true,
});

// Skill categories
export const skillCategories = pgTable("skill_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSkillCategorySchema = createInsertSchema(skillCategories).pick({
  name: true,
  icon: true,
});

// Skills
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => skillCategories.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  name: true,
  categoryId: true,
});

// Experience
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description").notNull(),
  type: text("type").notNull().default("Full-time"),
  technologies: jsonb("technologies"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertExperienceSchema = createInsertSchema(experiences).pick({
  title: true,
  company: true,
  location: true,
  startDate: true,
  endDate: true,
  description: true,
  type: true,
  technologies: true,
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  demoLink: text("demo_link"),
  repoLink: text("repo_link"),
  technologies: jsonb("technologies"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
  image: true,
  demoLink: true,
  repoLink: true,
  technologies: true,
});

// Contact info
export const contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  description: text("description"),
  email: text("email"),
  phone: text("phone"),
  location: text("location"),
  socialLinks: jsonb("social_links"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContactInfoSchema = createInsertSchema(contactInfo).pick({
  description: true,
  email: true,
  phone: true,
  location: true,
  socialLinks: true,
});

// Contact messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  read: boolean("read").notNull().default(false),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;

export type Hero = typeof hero.$inferSelect;
export type InsertHero = z.infer<typeof insertHeroSchema>;

export type About = typeof about.$inferSelect;
export type InsertAbout = z.infer<typeof insertAboutSchema>;

export type SkillCategory = typeof skillCategories.$inferSelect;
export type InsertSkillCategory = z.infer<typeof insertSkillCategorySchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ContactInfo = typeof contactInfo.$inferSelect;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
