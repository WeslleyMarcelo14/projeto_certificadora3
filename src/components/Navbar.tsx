// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="w-full bg-purple-700 text-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:text-purple-200 transition-colors duration-300">
          Certificadora 3 - Meninas Digitais
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/palestra" className="font-medium text-lg hover:text-purple-200 transition-colors duration-300">
            Palestra
          </Link>
          <a 
            href="https://github.com/seu-usuario/repo"  
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-lg hover:text-purple-200 transition-colors duration-300"
          >
            GitHub
          </a>
          <a 
            href="https://www.instagram.com/meninasdigitaisutfprcp"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-lg hover:text-purple-200 transition-colors duration-300"
          >
            Sobre
          </a>
        </div>
      </nav>
    </header>
  );
}