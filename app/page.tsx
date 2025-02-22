"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  glowKeyframes,
  featureCardStyles,
  gradientTextStyles,
  containerStyles,
} from "./styles/components";

const MotionBox = motion(Box);

export default function Home() {
  const glow = `${glowKeyframes} 3s infinite`;
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/prompts");
    }
  }, [user, router]);

  return (
    <Box
      minH="100vh"
      bg="space.black"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.1) 0%, transparent 50%)",
        pointerEvents: "none",
      }}
    >
      <Container {...containerStyles}>
        <VStack spacing={12} align="stretch">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            textAlign="center"
          >
            <Heading as="h1" size="3xl" mb={6} {...gradientTextStyles}>
              Store and Manage Your{" "}
              <Text
                as="span"
                color={"white"}
                position="relative"
                _after={{
                  content: '""',
                  width: "full",
                  height: "30%",
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  bg: "neon.blue",
                  zIndex: -1,
                }}
              >
                AI Prompts
              </Text>
            </Heading>
            <Text
              fontSize="xl"
              color="whiteAlpha.800"
              maxW="3xl"
              mx="auto"
              lineHeight="tall"
            >
              Proompty helps you organize, store, and manage your AI prompts in
              one secure place. Never lose a great prompt again.
            </Text>
            <Box mt={10} display="flex" gap={6} justifyContent="center">
              <Button
                as={Link}
                href="/signup"
                variant="cyber"
                size="lg"
                px={8}
                fontSize="lg"
                animation={glow}
              >
                Get Started
              </Button>
              <Button
                as={Link}
                href="/login"
                variant="neon"
                size="lg"
                px={8}
                fontSize="lg"
              >
                Sign In
              </Button>
            </Box>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={16}
              mt={24}
              px={{ base: 4, md: 8, lg: 12 }}
              pt={16}
            >
              {[
                {
                  title: "Organize Your Prompts",
                  description:
                    "Categorize and tag your prompts for easy access and better organization.",
                  icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                  color: "neon.blue",
                },
                {
                  title: "Secure Storage",
                  description:
                    "Your prompts are safely stored and accessible only to you.",
                  icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                  color: "neon.purple",
                },
                {
                  title: "Easy Updates",
                  description:
                    "Quickly edit and update your prompts as your needs evolve.",
                  icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                  color: "neon.cyan",
                },
              ].map((feature, index) => (
                <VStack key={index} {...featureCardStyles.container}>
                  <Box
                    {...featureCardStyles.iconBox}
                    bg={`rgba(${
                      feature.color === "neon.blue"
                        ? "0, 243, 255"
                        : feature.color === "neon.purple"
                        ? "157, 0, 255"
                        : "0, 255, 242"
                    }, 0.1)`}
                    color={feature.color}
                    _after={{
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: "xl",
                      boxShadow: `0 0 15px ${
                        feature.color === "neon.blue"
                          ? "rgba(0, 243, 255, 0.3)"
                          : feature.color === "neon.purple"
                          ? "rgba(157, 0, 255, 0.3)"
                          : "rgba(0, 255, 242, 0.3)"
                      }`,
                    }}
                  >
                    <Icon boxSize={6} viewBox="0 0 24 24">
                      <path fill="currentColor" d={feature.icon} />
                    </Icon>
                  </Box>
                  <Heading
                    size="md"
                    color="whiteAlpha.900"
                    fontWeight="semibold"
                  >
                    {feature.title}
                  </Heading>
                  <Text color="whiteAlpha.700" textAlign="center">
                    {feature.description}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
