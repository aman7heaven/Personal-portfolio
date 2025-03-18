import { useQuery } from "@tanstack/react-query";
import NavBar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import SkillsSection from "@/components/skills-section";
import ExperienceSection from "@/components/experience-section";
import ProjectsSection from "@/components/projects-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import { SiteConfig, Hero, About, SkillCategory, Skill, Experience, Project, ContactInfo } from "@shared/schema";
import { useEffect } from "react";

export default function HomePage() {
  // Fetch site configuration
  const { data: siteConfig } = useQuery<SiteConfig>({
    queryKey: ["/api/site-config"],
  });

  // Fetch all necessary data
  const { data: heroData } = useQuery<Hero>({
    queryKey: ["/api/hero"],
  });

  const { data: aboutData } = useQuery<About>({
    queryKey: ["/api/about"],
  });

  const { data: skillCategories } = useQuery<SkillCategory[]>({
    queryKey: ["/api/skill-categories"],
  });

  const { data: skills } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: experiences } = useQuery<Experience[]>({
    queryKey: ["/api/experiences"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  // Update document title based on site configuration
  useEffect(() => {
    if (siteConfig?.siteName) {
      document.title = siteConfig.siteName;
    }
  }, [siteConfig]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar siteName={siteConfig?.siteName || "Portfolio"} />
      
      {heroData && (
        <HeroSection
          greeting={heroData.greeting}
          name={heroData.name}
          tagline={heroData.tagline}
        />
      )}
      
      {aboutData && (
        <AboutSection about={aboutData} />
      )}
      
      {skillCategories && skills && (
        <SkillsSection 
          categories={skillCategories}
          skills={skills}
        />
      )}
      
      {experiences && (
        <ExperienceSection experiences={experiences} />
      )}
      
      {projects && (
        <ProjectsSection projects={projects} />
      )}
      
      {contactInfo && (
        <ContactSection contactInfo={contactInfo} />
      )}
      
      <Footer siteName={siteConfig?.siteName || "Portfolio"} />
    </div>
  );
}
