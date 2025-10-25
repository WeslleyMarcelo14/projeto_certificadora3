import { FaGithub, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-primary via-primary-hover to-accent text-primary-foreground py-5 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <p className="font-semibold text-lg">&copy; {new Date().getFullYear()} Projeto Certificadora 3</p>
          <p className="text-primary-foreground/80 mt-1">Meninas Digitais - UTFPR-CP</p>
        </div>
        <div className="flex items-center space-x-6">
          <a 
            href="https://github.com/WeslleyMarcelo14/projeto_certificadora3" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-3xl hover:opacity-80 transition-opacity duration-300"
          >
            <FaGithub />
          </a>
          <a 
            href="https://www.instagram.com/meninasdigitaisutfprcp" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-3xl hover:opacity-80 transition-opacity duration-300"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}