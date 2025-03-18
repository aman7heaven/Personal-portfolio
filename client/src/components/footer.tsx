import { Link } from "wouter";

interface FooterProps {
  siteName: string;
}

export default function Footer({ siteName }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <span className="text-2xl font-bold text-white cursor-pointer">{siteName}</span>
          </Link>
        </div>
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <a href="#about" className="text-base text-gray-300 hover:text-white">
              About
            </a>
          </div>
          <div className="px-5 py-2">
            <a href="#skills" className="text-base text-gray-300 hover:text-white">
              Skills
            </a>
          </div>
          <div className="px-5 py-2">
            <a href="#experience" className="text-base text-gray-300 hover:text-white">
              Experience
            </a>
          </div>
          <div className="px-5 py-2">
            <a href="#projects" className="text-base text-gray-300 hover:text-white">
              Projects
            </a>
          </div>
          <div className="px-5 py-2">
            <a href="#contact" className="text-base text-gray-300 hover:text-white">
              Contact
            </a>
          </div>
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-white">
            <span className="sr-only">Twitter</span>
            <i className="fab fa-twitter text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <span className="sr-only">LinkedIn</span>
            <i className="fab fa-linkedin text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <span className="sr-only">GitHub</span>
            <i className="fab fa-github text-xl"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <span className="sr-only">Instagram</span>
            <i className="fab fa-instagram text-xl"></i>
          </a>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          © {currentYear} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
