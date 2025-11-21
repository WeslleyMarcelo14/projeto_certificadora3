// page.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/Providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Certificadora 3 - Meninas Digitais"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="overflow-x-hidden">
      <body className="antialiased bg-gray-50 flex flex-col min-h-screen overflow-x-hidden">
        <Providers>
          <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}