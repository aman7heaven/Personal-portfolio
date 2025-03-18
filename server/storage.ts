import { 
  users, type User, type InsertUser,
  portfolioInfo, type PortfolioInfo, type InsertPortfolioInfo,
  socialLinks, type SocialLink, type InsertSocialLink,
  skills, type Skill, type InsertSkill,
  experiences, type Experience, type InsertExperience,
  experienceTechnologies, type ExperienceTechnology, type InsertExperienceTechnology,
  projects, type Project, type InsertProject,
  projectTechnologies, type ProjectTechnology, type InsertProjectTechnology,
  setupKeys, type SetupKey, type InsertSetupKey,
  ExperienceWithTechnologies, ProjectWithTechnologies
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Portfolio info methods
  getPortfolioInfo(): Promise<PortfolioInfo | undefined>;
  updatePortfolioInfo(info: InsertPortfolioInfo): Promise<PortfolioInfo>;
  
  // Social links methods
  getSocialLinks(): Promise<SocialLink[]>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, link: InsertSocialLink): Promise<SocialLink | undefined>;
  deleteSocialLink(id: number): Promise<boolean>;
  
  // Skills methods
  getSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: InsertSkill): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Experience methods
  getExperiences(): Promise<ExperienceWithTechnologies[]>;
  getExperience(id: number): Promise<ExperienceWithTechnologies | undefined>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: InsertExperience): Promise<Experience | undefined>;
  deleteExperience(id: number): Promise<boolean>;
  
  // Experience technologies methods
  createExperienceTechnology(tech: InsertExperienceTechnology): Promise<ExperienceTechnology>;
  deleteExperienceTechnologiesByExperienceId(experienceId: number): Promise<boolean>;
  
  // Project methods
  getProjects(): Promise<ProjectWithTechnologies[]>;
  getProject(id: number): Promise<ProjectWithTechnologies | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: InsertProject): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Project technologies methods
  createProjectTechnology(tech: InsertProjectTechnology): Promise<ProjectTechnology>;
  deleteProjectTechnologiesByProjectId(projectId: number): Promise<boolean>;
  
  // Setup key methods
  getSetupKeyByKey(key: string): Promise<SetupKey | undefined>;
  markSetupKeyAsUsed(id: number): Promise<boolean>;
  createSetupKey(key: InsertSetupKey): Promise<SetupKey>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Portfolio info methods
  async getPortfolioInfo(): Promise<PortfolioInfo | undefined> {
    const [info] = await db.select().from(portfolioInfo);
    return info;
  }
  
  async updatePortfolioInfo(info: InsertPortfolioInfo): Promise<PortfolioInfo> {
    const existing = await this.getPortfolioInfo();
    
    if (existing) {
      const [updated] = await db
        .update(portfolioInfo)
        .set({ ...info, updatedAt: new Date() })
        .where(eq(portfolioInfo.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(portfolioInfo).values(info).returning();
      return created;
    }
  }
  
  // Social links methods
  async getSocialLinks(): Promise<SocialLink[]> {
    return db.select().from(socialLinks);
  }
  
  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    const [created] = await db.insert(socialLinks).values(link).returning();
    return created;
  }
  
  async updateSocialLink(id: number, link: InsertSocialLink): Promise<SocialLink | undefined> {
    const [updated] = await db
      .update(socialLinks)
      .set({ ...link, updatedAt: new Date() })
      .where(eq(socialLinks.id, id))
      .returning();
    return updated;
  }
  
  async deleteSocialLink(id: number): Promise<boolean> {
    const result = await db.delete(socialLinks).where(eq(socialLinks.id, id));
    return true;
  }
  
  // Skills methods
  async getSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }
  
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [created] = await db.insert(skills).values(skill).returning();
    return created;
  }
  
  async updateSkill(id: number, skill: InsertSkill): Promise<Skill | undefined> {
    const [updated] = await db
      .update(skills)
      .set({ ...skill, updatedAt: new Date() })
      .where(eq(skills.id, id))
      .returning();
    return updated;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    await db.delete(skills).where(eq(skills.id, id));
    return true;
  }
  
  // Experience methods
  async getExperiences(): Promise<ExperienceWithTechnologies[]> {
    const experiencesList = await db
      .select()
      .from(experiences)
      .orderBy(asc(experiences.order));
    
    const result: ExperienceWithTechnologies[] = [];
    
    for (const exp of experiencesList) {
      const techs = await db
        .select()
        .from(experienceTechnologies)
        .where(eq(experienceTechnologies.experienceId, exp.id));
      
      result.push({
        ...exp,
        technologies: techs
      });
    }
    
    return result;
  }
  
  async getExperience(id: number): Promise<ExperienceWithTechnologies | undefined> {
    const [exp] = await db
      .select()
      .from(experiences)
      .where(eq(experiences.id, id));
    
    if (!exp) return undefined;
    
    const techs = await db
      .select()
      .from(experienceTechnologies)
      .where(eq(experienceTechnologies.experienceId, id));
    
    return {
      ...exp,
      technologies: techs
    };
  }
  
  async createExperience(experience: InsertExperience): Promise<Experience> {
    const [created] = await db.insert(experiences).values(experience).returning();
    return created;
  }
  
  async updateExperience(id: number, experience: InsertExperience): Promise<Experience | undefined> {
    const [updated] = await db
      .update(experiences)
      .set({ ...experience, updatedAt: new Date() })
      .where(eq(experiences.id, id))
      .returning();
    return updated;
  }
  
  async deleteExperience(id: number): Promise<boolean> {
    await db.delete(experiences).where(eq(experiences.id, id));
    return true;
  }
  
  // Experience technologies methods
  async createExperienceTechnology(tech: InsertExperienceTechnology): Promise<ExperienceTechnology> {
    const [created] = await db.insert(experienceTechnologies).values(tech).returning();
    return created;
  }
  
  async deleteExperienceTechnologiesByExperienceId(experienceId: number): Promise<boolean> {
    await db.delete(experienceTechnologies).where(eq(experienceTechnologies.experienceId, experienceId));
    return true;
  }
  
  // Project methods
  async getProjects(): Promise<ProjectWithTechnologies[]> {
    const projectsList = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.order));
    
    const result: ProjectWithTechnologies[] = [];
    
    for (const proj of projectsList) {
      const techs = await db
        .select()
        .from(projectTechnologies)
        .where(eq(projectTechnologies.projectId, proj.id));
      
      result.push({
        ...proj,
        technologies: techs
      });
    }
    
    return result;
  }
  
  async getProject(id: number): Promise<ProjectWithTechnologies | undefined> {
    const [proj] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    
    if (!proj) return undefined;
    
    const techs = await db
      .select()
      .from(projectTechnologies)
      .where(eq(projectTechnologies.projectId, id));
    
    return {
      ...proj,
      technologies: techs
    };
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }
  
  async updateProject(id: number, project: InsertProject): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }
  
  // Project technologies methods
  async createProjectTechnology(tech: InsertProjectTechnology): Promise<ProjectTechnology> {
    const [created] = await db.insert(projectTechnologies).values(tech).returning();
    return created;
  }
  
  async deleteProjectTechnologiesByProjectId(projectId: number): Promise<boolean> {
    await db.delete(projectTechnologies).where(eq(projectTechnologies.projectId, projectId));
    return true;
  }
  
  // Setup key methods
  async getSetupKeyByKey(key: string): Promise<SetupKey | undefined> {
    const [setupKey] = await db
      .select()
      .from(setupKeys)
      .where(eq(setupKeys.key, key));
    return setupKey;
  }
  
  async markSetupKeyAsUsed(id: number): Promise<boolean> {
    await db
      .update(setupKeys)
      .set({ used: true })
      .where(eq(setupKeys.id, id));
    return true;
  }
  
  async createSetupKey(key: InsertSetupKey): Promise<SetupKey> {
    const [created] = await db.insert(setupKeys).values(key).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
