import Link from "next/link";
import { FaGithub, FaInstagram } from "react-icons/fa";

export default function Navbar() {
  return (
    <header className="w-full bg-gradient-to-r from-primary via-primary-hover to-accent shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between px-2 py-5">
        <Link 
          href="/" 
          className="text-2xl md:text-3xl font-bold tracking-tight text-primary-foreground hover:opacity-90 transition-opacity duration-300"
        >
          Certificadora 3 - Meninas Digitais
        </Link>
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link 
            href="/palestra/" 
            className="font-medium text-base md:text-lg text-primary-foreground/90 hover:text-primary-foreground transition-colors duration-300"
          >
            Palestras
          </Link>
          <Link 
            href="/relatorios/" 
            className="font-medium text-base md:text-lg text-primary-foreground/90 hover:text-primary-foreground transition-colors duration-300"
          >
            Relatórios
          </Link>
          <a 
            href="https://github.com/WeslleyMarcelo14/projeto_certificadora3"  
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl md:text-2xl text-primary-foreground/90 hover:text-primary-foreground transition-colors duration-300"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a 
            href="https://www.instagram.com/meninasdigitaisutfprcp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl md:text-2xl text-primary-foreground/90 hover:text-primary-foreground transition-colors duration-300"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
        </div>
      </nav>
    </header>
  );
}
