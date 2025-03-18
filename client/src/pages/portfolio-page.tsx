import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/portfolio/header";
import HeroSection from "@/components/portfolio/hero-section";
import AboutSection from "@/components/portfolio/about-section";
import SkillsSection from "@/components/portfolio/skills-section";
import ExperienceSection from "@/components/portfolio/experience-section";
import ProjectsSection from "@/components/portfolio/projects-section";
import ContactSection from "@/components/portfolio/contact-section";
import Footer from "@/components/portfolio/footer";
import { PortfolioInfo, SocialLink, Skill, ExperienceWithTechnologies, ProjectWithTechnologies } from "@shared/schema";

export default function PortfolioPage() {
  const { data: portfolioInfo } = useQuery<PortfolioInfo>({ 
    queryKey: ['/api/portfolio-info'] 
  });
  
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({ 
    queryKey: ['/api/social-links'] 
  });
  
  const { data: skills = [] } = useQuery<Skill[]>({ 
    queryKey: ['/api/skills'] 
  });
  
  const { data: experiences = [] } = useQuery<ExperienceWithTechnologies[]>({ 
    queryKey: ['/api/experiences'] 
  });
  
  const { data: projects = [] } = useQuery<ProjectWithTechnologies[]>({ 
    queryKey: ['/api/projects'] 
  });
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle route navigation and close mobile menu
  const handleNavigation = () => {
    setMobileMenuOpen(false);
  };
  
  // Implement smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchorLink = target.closest('a[href^="#"]');
      
      if (anchorLink) {
        e.preventDefault();
        
        // Close mobile menu if open
        setMobileMenuOpen(false);
        
        // Get target element
        const targetId = anchorLink.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId!);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);
  
  if (!portfolioInfo) {
    // Show minimal loading state for first load
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse">
          <h2 className="text-xl text-slate-600">Loading portfolio...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        portfolioName={portfolioInfo.name} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onNavigation={handleNavigation}
      />
      
      <main className="flex-grow">
        <HeroSection 
          title={portfolioInfo.heroTitle} 
          subtitle={portfolioInfo.heroSubtitle} 
        />
        
        <AboutSection 
          description={portfolioInfo.aboutDescription}
          additionalInfo={portfolioInfo.aboutAdditionalInfo}
          profileImage={portfolioInfo.profileImage}
          socialLinks={socialLinks}
        />
        
        <SkillsSection skills={skills} />
        
        <ExperienceSection experiences={experiences} />
        
        <ProjectsSection projects={projects} />
        
        <ContactSection 
          location={portfolioInfo.contactLocation}
          email={portfolioInfo.contactEmail}
          phone={portfolioInfo.contactPhone}
          socialLinks={socialLinks}
        />
      </main>
      
      <Footer 
        portfolioName={portfolioInfo.name}
        copyright={portfolioInfo.footerCopyright}
        socialLinks={socialLinks}
      />
    </div>
  );
}
