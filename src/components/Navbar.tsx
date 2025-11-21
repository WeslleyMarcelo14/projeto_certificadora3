import Link from "next/link";
import { FaGithub, FaInstagram } from "react-icons/fa";

export default function Navbar() {
  return (
    <header className="w-full bg-gradient-to-r from-primary via-primary-hover to-accent shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 gap-4 sm:gap-0">
        <Link 
          href="/" 
          className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-primary-foreground hover:opacity-90 hover:scale-[1.02] transition-all duration-300 break-words"
        >
          <span className="block sm:inline">Certificadora 3 -</span>
          <span className="block sm:inline sm:ml-1">Meninas Digitais</span>
        </Link>
        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 w-full sm:w-auto justify-between sm:justify-end">
          <Link 
            href="/palestra/" 
            className="font-medium text-sm sm:text-base lg:text-lg text-primary-foreground/90 hover:text-primary-foreground hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap relative group"
          >
            <span className="relative z-10">Palestras</span>
            <div className="absolute inset-0 bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-1"></div>
          </Link>
          <Link 
            href="/relatorios/" 
            className="font-medium text-sm sm:text-base lg:text-lg text-primary-foreground/90 hover:text-primary-foreground hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap relative group"
          >
            <span className="relative z-10">Relatórios</span>
            <div className="absolute inset-0 bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-1"></div>
          </Link>
          <a 
            href="https://github.com/WeslleyMarcelo14/projeto_certificadora3"  
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg sm:text-xl lg:text-2xl text-primary-foreground/90 hover:text-primary-foreground hover:scale-110 hover:-translate-y-1 hover:rotate-3 transition-all duration-300 relative group"
            aria-label="GitHub"
          >
            <div className="relative">
              <FaGithub />
              <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150"></div>
            </div>
          </a>
          <a 
            href="https://www.instagram.com/meninasdigitaisutfprcp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg sm:text-xl lg:text-2xl text-primary-foreground/90 hover:text-primary-foreground hover:scale-110 hover:-translate-y-1 hover:-rotate-3 transition-all duration-300 relative group"
            aria-label="Instagram"
          >
            <div className="relative">
              <FaInstagram />
              <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150"></div>
            </div>
          </a>
        </div>
      </nav>
    </header>
  );
}
