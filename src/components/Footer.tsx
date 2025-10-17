// components/Footer.tsx
import Link from 'next/link';
import { FaGithub, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-gray-300 py-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} Projeto Certificadora 3</p>
          <p>Meninas Digitais - UTFPR-CP</p>
        </div>

        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com/WeslleyMarcelo14/projeto_certificadora3" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-2xl hover:text-purple-400 transition-colors duration-300"
          >
            <FaGithub />
          </a>
          <a 
            href="https://www.instagram.com/meninasdigitaisutfprcp" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-2xl hover:text-purple-400 transition-colors duration-300"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}