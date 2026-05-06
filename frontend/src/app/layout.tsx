import "@/app/globals.css";
import { BackgroundBeam } from "../components/ui/BackgroundBeam";
import { Navbar } from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 antialiased">
        <BackgroundBeam />
        <Navbar />
        <main className="relative z-10 min-h-screen p-8">{children}</main>
      </body>
    </html>
  );
}
