// app/layout.tsx

import { Inter, Exo_2 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";
import LenisProvider from "./components/LenisProvider";
import Proompty3DBackground from "./components/Proompty3DBackground";
import { Box } from "@chakra-ui/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PromptVault",
  description: "Manage and organize your AI prompts",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: '--font-inter',
});

const exo2 = Exo_2({
  subsets: ["latin"],
  display: "swap",
  variable: '--font-exo2',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${exo2.variable}`}>
      <body>
        <Providers>
          <LenisProvider>
            {/* 3D WebGL Background - Visible on all pages */}
            <Proompty3DBackground />

            <Navbar />
            <Box as="main" minH="calc(100vh - 72px)" bg="space.black" position="relative" zIndex={1}>
              {children}
            </Box>
          </LenisProvider>
        </Providers>
      </body>
    </html>
  );
}
