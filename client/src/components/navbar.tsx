import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface NavBarProps {
  siteName: string;
}

export default function NavBar({ siteName }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Use direct query instead of useAuth
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Handle scroll event to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? "shadow-sm" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-xl font-bold text-primary cursor-pointer">{siteName}</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="#about" className={`border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === "/#about" ? "border-primary text-primary" : ""}`}>
                About
              </a>
              <a href="#skills" className={`border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === "/#skills" ? "border-primary text-primary" : ""}`}>
                Skills
              </a>
              <a href="#experience" className={`border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === "/#experience" ? "border-primary text-primary" : ""}`}>
                Experience
              </a>
              <a href="#projects" className={`border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === "/#projects" ? "border-primary text-primary" : ""}`}>
                Projects
              </a>
              <a href="#contact" className={`border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === "/#contact" ? "border-primary text-primary" : ""}`}>
                Contact
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <Button 
                variant="outline" 
                className="px-3 py-1 text-sm"
                onClick={() => window.location.href = user.isAdmin ? "/admin" : "/"}
              >
                {user.isAdmin ? "Admin Dashboard" : "My Account"}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="px-3 py-1 text-sm text-primary border-primary"
                onClick={() => window.location.href = "/auth"}
              >
                Admin Login
              </Button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>

      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <a
            href="#about"
            className="text-gray-600 hover:bg-primary hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </a>
          <a
            href="#skills"
            className="text-gray-600 hover:bg-primary hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Skills
          </a>
          <a
            href="#experience"
            className="text-gray-600 hover:bg-primary hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Experience
          </a>
          <a
            href="#projects"
            className="text-gray-600 hover:bg-primary hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Projects
          </a>
          <a
            href="#contact"
            className="text-gray-600 hover:bg-primary hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </a>
          {user ? (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                window.location.href = user.isAdmin ? "/admin" : "/";
              }}
              className="w-full text-left text-primary hover:bg-primary hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
            >
              {user.isAdmin ? "Admin Dashboard" : "My Account"}
            </button>
          ) : (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                window.location.href = "/auth";
              }}
              className="w-full text-left text-primary hover:bg-primary hover:text-white block pl-3 pr-4 py-2 text-base font-medium"
            >
              Admin Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
