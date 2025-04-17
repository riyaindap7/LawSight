import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider
import { AuthProvider } from "@/context/AuthContext";
export const metadata: Metadata = {
  title: "LawSight",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
