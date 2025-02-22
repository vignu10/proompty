// app/layout.tsx

import { Inter } from "next/font/google";
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
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          <Navbar />
          <Box as="main" minH="calc(100vh - 72px)" bg="gray.50">
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  );
}
