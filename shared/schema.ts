import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

// Basic portfolio information
export const portfolioInfo = pgTable("portfolio_info", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  profileImage: text("profile_image").notNull(),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  aboutDescription: text("about_description").notNull(),
  aboutAdditionalInfo: text("about_additional_info"),
  contactLocation: text("contact_location"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  footerCopyright: text("footer_copyright").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPortfolioInfoSchema = createInsertSchema(portfolioInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Social links
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Skills
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Experiences
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  period: text("period").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Experience Technologies
export const experienceTechnologies = pgTable("experience_technologies", {
  id: serial("id").primaryKey(),
  experienceId: integer("experience_id").notNull().references(() => experiences.id, { onDelete: "cascade" }),
  name: text("name").notNull()
});

export const insertExperienceTechnologySchema = createInsertSchema(experienceTechnologies).omit({
  id: true,
});

// Experience Relations
export const experiencesRelations = relations(experiences, ({ many }) => ({
  technologies: many(experienceTechnologies),
}));

export const experienceTechnologiesRelations = relations(experienceTechnologies, ({ one }) => ({
  experience: one(experiences, {
    fields: [experienceTechnologies.experienceId],
    references: [experiences.id],
  }),
}));

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  liveUrl: text("live_url"),
  codeUrl: text("code_url"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Project Technologies
export const projectTechnologies = pgTable("project_technologies", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull()
});

export const insertProjectTechnologySchema = createInsertSchema(projectTechnologies).omit({
  id: true,
});

// Project Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  technologies: many(projectTechnologies),
}));

export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
  project: one(projects, {
    fields: [projectTechnologies.projectId],
    references: [projects.id],
  }),
}));

// Setup Key
export const setupKeys = pgTable("setup_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSetupKeySchema = createInsertSchema(setupKeys).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPortfolioInfo = z.infer<typeof insertPortfolioInfoSchema>;
export type PortfolioInfo = typeof portfolioInfo.$inferSelect;

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;

export type InsertExperienceTechnology = z.infer<typeof insertExperienceTechnologySchema>;
export type ExperienceTechnology = typeof experienceTechnologies.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertProjectTechnology = z.infer<typeof insertProjectTechnologySchema>;
export type ProjectTechnology = typeof projectTechnologies.$inferSelect;

export type InsertSetupKey = z.infer<typeof insertSetupKeySchema>;
export type SetupKey = typeof setupKeys.$inferSelect;

// Combined types for frontend
export interface ProjectWithTechnologies extends Project {
  technologies: ProjectTechnology[];
}

export interface ExperienceWithTechnologies extends Experience {
  technologies: ExperienceTechnology[];
}
