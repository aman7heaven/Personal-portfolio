import { db } from "./db";
import session from "express-session";
import createMemoryStore from "memorystore";
import { eq } from "drizzle-orm";

import {
  users,
  siteConfig,
  hero,
  about,
  skillCategories,
  skills,
  experiences,
  projects,
  contactInfo,
  contactMessages,
  type User,
  type InsertUser,
  type SiteConfig,
  type InsertSiteConfig,
  type Hero,
  type InsertHero,
  type About,
  type InsertAbout,
  type SkillCategory,
  type InsertSkillCategory,
  type Skill,
  type InsertSkill,
  type Experience,
  type InsertExperience,
  type Project,
  type InsertProject,
  type ContactInfo,
  type InsertContactInfo,
  type ContactMessage,
  type InsertContactMessage
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  checkAdminExists(): Promise<boolean>;

  // Site config operations
  getSiteConfig(): Promise<SiteConfig | undefined>;
  createSiteConfig(config: InsertSiteConfig): Promise<SiteConfig>;
  updateSiteConfig(config: Partial<InsertSiteConfig>): Promise<SiteConfig>;

  // Hero operations
  getHero(): Promise<Hero | undefined>;
  createHero(heroData: InsertHero): Promise<Hero>;
  updateHero(heroData: Partial<InsertHero>): Promise<Hero>;

  // About operations
  getAbout(): Promise<About | undefined>;
  createAbout(aboutData: InsertAbout): Promise<About>;
  updateAbout(aboutData: Partial<InsertAbout>): Promise<About>;

  // Skill category operations
  getSkillCategories(): Promise<SkillCategory[]>;
  getSkillCategory(id: number): Promise<SkillCategory | undefined>;
  createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory>;
  updateSkillCategory(id: number, category: Partial<InsertSkillCategory>): Promise<SkillCategory | undefined>;
  deleteSkillCategory(id: number): Promise<void>;

  // Skill operations
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<void>;

  // Experience operations
  getExperiences(): Promise<Experience[]>;
  getExperience(id: number): Promise<Experience | undefined>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<void>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;

  // Contact info operations
  getContactInfo(): Promise<ContactInfo | undefined>;
  createContactInfo(info: InsertContactInfo): Promise<ContactInfo>;
  updateContactInfo(info: Partial<InsertContactInfo>): Promise<ContactInfo>;

  // Contact message operations
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markContactMessageAsRead(id: number): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async checkAdminExists(): Promise<boolean> {
    const [admin] = await db.select().from(users).where(eq(users.isAdmin, true));
    return !!admin;
  }

  // Site config operations
  async getSiteConfig(): Promise<SiteConfig | undefined> {
    const [config] = await db.select().from(siteConfig);
    return config;
  }

  async createSiteConfig(config: InsertSiteConfig): Promise<SiteConfig> {
    const [newConfig] = await db.insert(siteConfig).values(config).returning();
    return newConfig;
  }

  async updateSiteConfig(config: Partial<InsertSiteConfig>): Promise<SiteConfig> {
    const [existingConfig] = await db.select().from(siteConfig);
    
    if (!existingConfig) {
      throw new Error("Site configuration not found");
    }
    
    const now = new Date();
    const [updatedConfig] = await db
      .update(siteConfig)
      .set({ ...config, updatedAt: now })
      .where(eq(siteConfig.id, existingConfig.id))
      .returning();
    
    return updatedConfig;
  }

  // Hero operations
  async getHero(): Promise<Hero | undefined> {
    const [heroData] = await db.select().from(hero);
    
    if (!heroData) {
      // Create default hero if it doesn't exist
      return this.createHero({
        greeting: "Hello, I'm",
        name: "John Doe",
        tagline: "Full Stack Developer & UI/UX Designer"
      });
    }
    
    return heroData;
  }

  async createHero(heroData: InsertHero): Promise<Hero> {
    const [newHero] = await db.insert(hero).values(heroData).returning();
    return newHero;
  }

  async updateHero(heroData: Partial<InsertHero>): Promise<Hero> {
    let existingHero = await this.getHero();
    
    if (!existingHero) {
      throw new Error("Hero data not found");
    }
    
    const now = new Date();
    const [updatedHero] = await db
      .update(hero)
      .set({ ...heroData, updatedAt: now })
      .where(eq(hero.id, existingHero.id))
      .returning();
    
    return updatedHero;
  }

  // About operations
  async getAbout(): Promise<About | undefined> {
    const [aboutData] = await db.select().from(about);
    
    if (!aboutData) {
      // Create default about if it doesn't exist
      return this.createAbout({
        bio: "I'm a passionate developer with experience building web applications.",
        additionalInfo: "When I'm not coding, I enjoy exploring new technologies.",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80",
        details: [
          { icon: "envelope", label: "Email", value: "contact@example.com" },
          { icon: "map-marker-alt", label: "Location", value: "San Francisco, CA" }
        ],
        socialLinks: [
          { platform: "twitter", url: "https://twitter.com", icon: "twitter" },
          { platform: "linkedin", url: "https://linkedin.com", icon: "linkedin" },
          { platform: "github", url: "https://github.com", icon: "github" }
        ]
      });
    }
    
    return aboutData;
  }

  async createAbout(aboutData: InsertAbout): Promise<About> {
    const [newAbout] = await db.insert(about).values(aboutData).returning();
    return newAbout;
  }

  async updateAbout(aboutData: Partial<InsertAbout>): Promise<About> {
    let existingAbout = await this.getAbout();
    
    if (!existingAbout) {
      throw new Error("About data not found");
    }
    
    const now = new Date();
    const [updatedAbout] = await db
      .update(about)
      .set({ ...aboutData, updatedAt: now })
      .where(eq(about.id, existingAbout.id))
      .returning();
    
    return updatedAbout;
  }

  // Skill category operations
  async getSkillCategories(): Promise<SkillCategory[]> {
    return db.select().from(skillCategories);
  }

  async getSkillCategory(id: number): Promise<SkillCategory | undefined> {
    const [category] = await db.select().from(skillCategories).where(eq(skillCategories.id, id));
    return category;
  }

  async createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory> {
    const [newCategory] = await db.insert(skillCategories).values(category).returning();
    return newCategory;
  }

  async updateSkillCategory(id: number, category: Partial<InsertSkillCategory>): Promise<SkillCategory | undefined> {
    const now = new Date();
    const [updatedCategory] = await db
      .update(skillCategories)
      .set({ ...category, updatedAt: now })
      .where(eq(skillCategories.id, id))
      .returning();
    
    return updatedCategory;
  }

  async deleteSkillCategory(id: number): Promise<void> {
    await db.delete(skillCategories).where(eq(skillCategories.id, id));
  }

  // Skill operations
  async getSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }

  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    const now = new Date();
    const [updatedSkill] = await db
      .update(skills)
      .set({ ...skill, updatedAt: now })
      .where(eq(skills.id, id))
      .returning();
    
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Experience operations
  async getExperiences(): Promise<Experience[]> {
    return db.select().from(experiences);
  }

  async getExperience(id: number): Promise<Experience | undefined> {
    const [experience] = await db.select().from(experiences).where(eq(experiences.id, id));
    return experience;
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    const [newExperience] = await db.insert(experiences).values(experience).returning();
    return newExperience;
  }

  async updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience | undefined> {
    const now = new Date();
    const [updatedExperience] = await db
      .update(experiences)
      .set({ ...experience, updatedAt: now })
      .where(eq(experiences.id, id))
      .returning();
    
    return updatedExperience;
  }

  async deleteExperience(id: number): Promise<void> {
    await db.delete(experiences).where(eq(experiences.id, id));
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const now = new Date();
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: now })
      .where(eq(projects.id, id))
      .returning();
    
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Contact info operations
  async getContactInfo(): Promise<ContactInfo | undefined> {
    const [info] = await db.select().from(contactInfo);
    
    if (!info) {
      // Create default contact info if it doesn't exist
      return this.createContactInfo({
        description: "Have a project in mind or just want to say hello? Feel free to reach out!",
        email: "contact@example.com",
        phone: "(123) 456-7890",
        location: "San Francisco, CA",
        socialLinks: [
          { platform: "twitter", url: "https://twitter.com", icon: "twitter" },
          { platform: "linkedin", url: "https://linkedin.com", icon: "linkedin" },
          { platform: "github", url: "https://github.com", icon: "github" },
          { platform: "instagram", url: "https://instagram.com", icon: "instagram" }
        ]
      });
    }
    
    return info;
  }

  async createContactInfo(info: InsertContactInfo): Promise<ContactInfo> {
    const [newInfo] = await db.insert(contactInfo).values(info).returning();
    return newInfo;
  }

  async updateContactInfo(info: Partial<InsertContactInfo>): Promise<ContactInfo> {
    let existingInfo = await this.getContactInfo();
    
    if (!existingInfo) {
      throw new Error("Contact info not found");
    }
    
    const now = new Date();
    const [updatedInfo] = await db
      .update(contactInfo)
      .set({ ...info, updatedAt: now })
      .where(eq(contactInfo.id, existingInfo.id))
      .returning();
    
    return updatedInfo;
  }

  // Contact message operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(contactMessages.createdAt);
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async markContactMessageAsRead(id: number): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ read: true })
      .where(eq(contactMessages.id, id))
      .returning();
    
    return updatedMessage;
  }

  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }
}

export const storage = new DatabaseStorage();
