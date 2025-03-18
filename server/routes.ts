import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { initializeEmailTransport, sendEmail } from "./email";
import { 
  insertHeroSchema, 
  insertAboutSchema, 
  insertSkillCategorySchema, 
  insertSkillSchema,
  insertExperienceSchema, 
  insertProjectSchema, 
  insertContactInfoSchema,
  insertContactMessageSchema,
  insertSiteConfigSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Check admin middleware
const checkAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize email transport
  initializeEmailTransport();
  
  // Setup authentication
  setupAuth(app);
  
  // Initialize site config if not exists
  try {
    const config = await storage.getSiteConfig();
    if (!config) {
      const defaultSetupKey = process.env.DEFAULT_SETUP_KEY || "changeme";
      await storage.createSiteConfig({
        siteName: "Portfolio",
        setupKey: defaultSetupKey,
        primaryColor: "hsl(222.2 47.4% 11.2%)",
        metaDescription: "Professional Portfolio Website"
      });
      console.log(`Site initialized with default setup key: ${defaultSetupKey}`);
    }
  } catch (err) {
    console.error("Failed to initialize site config:", err);
  }

  // Site Configuration Routes
  app.get("/api/site-config", async (req, res) => {
    try {
      const config = await storage.getSiteConfig();
      if (!config) {
        return res.status(404).json({ message: "Site configuration not found" });
      }
      
      // Don't return setup key to client
      const { setupKey, ...publicConfig } = config;
      res.json(publicConfig);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site configuration" });
    }
  });

  app.patch("/api/admin/site-config", checkAdmin, async (req, res) => {
    try {
      const data = insertSiteConfigSchema.parse(req.body);
      const updated = await storage.updateSiteConfig(data);
      
      // Don't return setup key to client
      const { setupKey, ...publicConfig } = updated;
      res.json(publicConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update site configuration" });
    }
  });

  // Hero Routes
  app.get("/api/hero", async (req, res) => {
    try {
      const heroData = await storage.getHero();
      if (!heroData) {
        return res.status(404).json({ message: "Hero data not found" });
      }
      res.json(heroData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero data" });
    }
  });

  app.patch("/api/admin/hero", checkAdmin, async (req, res) => {
    try {
      const data = insertHeroSchema.parse(req.body);
      const updated = await storage.updateHero(data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update hero data" });
    }
  });

  // About Routes
  app.get("/api/about", async (req, res) => {
    try {
      const aboutData = await storage.getAbout();
      if (!aboutData) {
        return res.status(404).json({ message: "About data not found" });
      }
      res.json(aboutData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch about data" });
    }
  });

  app.patch("/api/admin/about", checkAdmin, async (req, res) => {
    try {
      const data = insertAboutSchema.parse(req.body);
      const updated = await storage.updateAbout(data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update about data" });
    }
  });

  // Skill Categories Routes
  app.get("/api/skill-categories", async (req, res) => {
    try {
      const categories = await storage.getSkillCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skill categories" });
    }
  });

  app.post("/api/admin/skill-categories", checkAdmin, async (req, res) => {
    try {
      const data = insertSkillCategorySchema.parse(req.body);
      const category = await storage.createSkillCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create skill category" });
    }
  });

  app.patch("/api/admin/skill-categories/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSkillCategorySchema.parse(req.body);
      const updated = await storage.updateSkillCategory(id, data);
      if (!updated) {
        return res.status(404).json({ message: "Skill category not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update skill category" });
    }
  });

  app.delete("/api/admin/skill-categories/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSkillCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete skill category" });
    }
  });

  // Skills Routes
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post("/api/admin/skills", checkAdmin, async (req, res) => {
    try {
      const data = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(data);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.patch("/api/admin/skills/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSkillSchema.parse(req.body);
      const updated = await storage.updateSkill(id, data);
      if (!updated) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/admin/skills/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSkill(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Experience Routes
  app.get("/api/experiences", async (req, res) => {
    try {
      const experiences = await storage.getExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiences" });
    }
  });

  app.post("/api/admin/experiences", checkAdmin, async (req, res) => {
    try {
      const data = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(data);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create experience" });
    }
  });

  app.patch("/api/admin/experiences/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertExperienceSchema.parse(req.body);
      const updated = await storage.updateExperience(id, data);
      if (!updated) {
        return res.status(404).json({ message: "Experience not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update experience" });
    }
  });

  app.delete("/api/admin/experiences/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExperience(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete experience" });
    }
  });

  // Projects Routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/admin/projects", checkAdmin, async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/admin/projects/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProjectSchema.parse(req.body);
      const updated = await storage.updateProject(id, data);
      if (!updated) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Contact Info Routes
  app.get("/api/contact-info", async (req, res) => {
    try {
      const contactInfo = await storage.getContactInfo();
      if (!contactInfo) {
        return res.status(404).json({ message: "Contact info not found" });
      }
      res.json(contactInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact info" });
    }
  });

  app.patch("/api/admin/contact-info", checkAdmin, async (req, res) => {
    try {
      const data = insertContactInfoSchema.parse(req.body);
      const updated = await storage.updateContactInfo(data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update contact info" });
    }
  });

  // Contact Message Routes
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(data);
      
      // Get contact info to send email notification
      const contactInfo = await storage.getContactInfo();
      if (contactInfo && contactInfo.email) {
        // Send email notification to portfolio owner
        await sendEmail({
          to: contactInfo.email,
          subject: `New Contact Message: ${data.subject}`,
          text: `
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
          `,
          html: `
<h2>New Contact Message</h2>
<p><strong>From:</strong> ${data.name} (${data.email})</p>
<p><strong>Subject:</strong> ${data.subject}</p>
<h3>Message:</h3>
<p>${data.message.replace(/\n/g, '<br>')}</p>
          `
        });
      }
      
      res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/admin/contact-messages", checkAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.patch("/api/admin/contact-messages/:id/read", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markContactMessageAsRead(id);
      if (!updated) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.delete("/api/admin/contact-messages/:id", checkAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContactMessage(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
