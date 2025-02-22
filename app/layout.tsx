// app/layout.tsx

import { Inter, Exo_2 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";
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
          <Navbar />
          <Box as="main" minH="calc(100vh - 72px)" bg="space.black">
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  );
}
