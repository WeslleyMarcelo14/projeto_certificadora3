import { FaGithub, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-primary via-primary-hover to-accent text-primary-foreground py-4 sm:py-5 mt-auto">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-base sm:text-lg">&copy; {new Date().getFullYear()} Projeto Certificadora 3</p>
          <p className="text-primary-foreground/80 mt-1 text-sm sm:text-base">Meninas Digitais - UTFPR-CP</p>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-6">
          <a 
            href="https://github.com/WeslleyMarcelo14/projeto_certificadora3" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-2xl sm:text-3xl hover:opacity-80 transition-opacity duration-300"
          >
            <FaGithub />
          </a>
          <a 
            href="https://www.instagram.com/meninasdigitaisutfprcp" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-2xl sm:text-3xl hover:opacity-80 transition-opacity duration-300"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}