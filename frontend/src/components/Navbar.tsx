"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Invest", href: "/invest" },
    { name: "Properties", href: "/properties" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 py-4">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white"
        >
          AFRIPROP NEXUS
        </Link>
        <div className="flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-blue-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
