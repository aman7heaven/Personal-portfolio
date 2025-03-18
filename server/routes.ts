import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendEmail } from "./mail";
import { insertPortfolioInfoSchema, insertSocialLinkSchema, insertSkillSchema, insertExperienceSchema, insertProjectSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ message: "Unauthorized: Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Portfolio info routes
  app.get("/api/portfolio-info", async (req, res, next) => {
    try {
      const info = await storage.getPortfolioInfo();
      res.json(info || {});
    } catch (err) {
      next(err);
    }
  });
  
  app.post("/api/portfolio-info", isAdmin, async (req, res, next) => {
    try {
      const data = insertPortfolioInfoSchema.parse(req.body);
      const updated = await storage.updatePortfolioInfo(data);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });
  
  // Social links routes
  app.get("/api/social-links", async (req, res, next) => {
    try {
      const links = await storage.getSocialLinks();
      res.json(links);
    } catch (err) {
      next(err);
    }
  });
  
  app.post("/api/social-links", isAdmin, async (req, res, next) => {
    try {
      const data = insertSocialLinkSchema.parse(req.body);
      const created = await storage.createSocialLink(data);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });
  
  app.put("/api/social-links/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSocialLinkSchema.parse(req.body);
      const updated = await storage.updateSocialLink(id, data);
      
      if (!updated) {
        return res.status(404).json({ message: "Social link not found" });
      }
      
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });
  
  app.delete("/api/social-links/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSocialLink(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });
  
  // Skills routes
  app.get("/api/skills", async (req, res, next) => {
    try {
      const skillsList = await storage.getSkills();
      res.json(skillsList);
    } catch (err) {
      next(err);
    }
  });
  
  app.post("/api/skills", isAdmin, async (req, res, next) => {
    try {
      const data = insertSkillSchema.parse(req.body);
      const created = await storage.createSkill(data);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });
  
  app.put("/api/skills/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSkillSchema.parse(req.body);
      const updated = await storage.updateSkill(id, data);
      
      if (!updated) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });
  
  app.delete("/api/skills/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSkill(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });
  
  // Experiences routes
  app.get("/api/experiences", async (req, res, next) => {
    try {
      const experiencesList = await storage.getExperiences();
      res.json(experiencesList);
    } catch (err) {
      next(err);
    }
  });
  
  app.get("/api/experiences/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const experience = await storage.getExperience(id);
      
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.json(experience);
    } catch (err) {
      next(err);
    }
  });
  
  app.post("/api/experiences", isAdmin, async (req, res, next) => {
    try {
      const { technologies, ...experienceData } = req.body;
      const data = insertExperienceSchema.parse(experienceData);
      
      const created = await storage.createExperience(data);
      
      if (technologies && Array.isArray(technologies)) {
        for (const tech of technologies) {
          await storage.createExperienceTechnology({
            experienceId: created.id,
            name: tech
          });
        }
      }
      
      const result = await storage.getExperience(created.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });
  
  app.put("/api/experiences/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { technologies, ...experienceData } = req.body;
      const data = insertExperienceSchema.parse(experienceData);
      
      const updated = await storage.updateExperience(id, data);
      
      if (!updated) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      if (technologies) {
        await storage.deleteExperienceTechnologiesByExperienceId(id);
        
        if (Array.isArray(technologies)) {
          for (const tech of technologies) {
            await storage.createExperienceTechnology({
              experienceId: id,
              name: tech
            });
          }
        }
      }
      
      const result = await storage.getExperience(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
  
  app.delete("/api/experiences/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExperience(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });
  
  // Projects routes
  app.get("/api/projects", async (req, res, next) => {
    try {
      const projectsList = await storage.getProjects();
      res.json(projectsList);
    } catch (err) {
      next(err);
    }
  });
  
  app.get("/api/projects/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (err) {
      next(err);
    }
  });
  
  app.post("/api/projects", isAdmin, async (req, res, next) => {
    try {
      const { technologies, ...projectData } = req.body;
      const data = insertProjectSchema.parse(projectData);
      
      const created = await storage.createProject(data);
      
      if (technologies && Array.isArray(technologies)) {
        for (const tech of technologies) {
          await storage.createProjectTechnology({
            projectId: created.id,
            name: tech
          });
        }
      }
      
      const result = await storage.getProject(created.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });
  
  app.put("/api/projects/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { technologies, ...projectData } = req.body;
      const data = insertProjectSchema.parse(projectData);
      
      const updated = await storage.updateProject(id, data);
      
      if (!updated) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (technologies) {
        await storage.deleteProjectTechnologiesByProjectId(id);
        
        if (Array.isArray(technologies)) {
          for (const tech of technologies) {
            await storage.createProjectTechnology({
              projectId: id,
              name: tech
            });
          }
        }
      }
      
      const result = await storage.getProject(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
  
  app.delete("/api/projects/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });
  
  // Contact form route
  app.post("/api/contact", async (req, res, next) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1)
      });
      
      const { name, email, subject, message } = schema.parse(req.body);
      
      const portfolioInfo = await storage.getPortfolioInfo();
      if (!portfolioInfo) {
        return res.status(500).json({ message: "Portfolio information not set up yet" });
      }
      
      const adminEmail = portfolioInfo.contactEmail;
      
      const emailSent = await sendEmail({
        to: adminEmail,
        from: email,
        subject: `Portfolio Contact: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      });
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send email" });
      }
      
      res.status(200).json({ message: "Message sent successfully" });
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
