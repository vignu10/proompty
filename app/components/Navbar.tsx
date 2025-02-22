"use client";

import { Link as ChakraLink } from "@chakra-ui/next-js";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu as ChakraMenu,
  MenuButton as ChakraMenuButton,
  MenuItem as ChakraMenuItem,
  MenuList as ChakraMenuList,
  Text,
  Icon,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useColorModeContext } from "@/app/context/ColorModeContext";
import {
  HamburgerIcon,
  ChevronDownIcon,
  SettingsIcon,
  LockIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toggleColorMode, isDark } = useColorModeContext();

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      bg="space.navy"
      borderBottom="1px"
      borderColor="whiteAlpha.200"
      backdropFilter="blur(10px)"
      sx={{
        "&::before": {
          content: '""',
          position: "absolute",
          bottom: "-1px",
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.5), transparent)",
        },
      }}
    >
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center">
          <ChakraLink href="/" _hover={{ textDecoration: "none" }}>
            <Heading
              size="lg"
              bgGradient="linear(to-r, neon.blue, neon.purple)"
              bgClip="text"
              fontWeight="bold"
              letterSpacing="tight"
            >
              Proompty
            </Heading>
          </ChakraLink>

          {/* Desktop Navigation */}
          <HStack
            spacing={4}
            display={{ base: "none", md: "flex" }}
            align="center"
          >
            <ChakraLink
              href="/prompts"
              color="whiteAlpha.900"
              fontWeight="medium"
              _hover={{
                color: "neon.blue",
                textShadow: "0 0 8px rgba(0, 243, 255, 0.5)",
              }}
            >
              Prompts
            </ChakraLink>

            {user ? (
              <>
                <ChakraMenu>
                  <ChakraMenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    className="button-primary"
                    variant="ghost"
                    _hover={{ filter: "brightness(1.2)" }}
                  >
                    <HStack spacing={2}>
                      <Icon as={SettingsIcon} />
                      <Text>{user.name || user.email}</Text>
                    </HStack>
                  </ChakraMenuButton>
                  <ChakraMenuList className="modal" p={2}>
                    <ChakraMenuItem
                      className="button-primary"
                      onClick={() => router.push("/settings")}
                      mb={2}
                      icon={<SettingsIcon />}
                    >
                      Settings
                    </ChakraMenuItem>
                    <ChakraMenuItem
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                      color="red.400"
                      _hover={{
                        bg: "rgba(255, 0, 0, 0.1)",
                        color: "red.300",
                      }}
                      icon={<LockIcon />}
                    >
                      Logout
                    </ChakraMenuItem>
                  </ChakraMenuList>
                </ChakraMenu>
              </>
            ) : (
              <>
                <ChakraLink
                  href="/login"
                  color="whiteAlpha.900"
                  fontWeight="medium"
                  _hover={{
                    color: "neon.blue",
                    textShadow: "0 0 8px rgba(0, 243, 255, 0.5)",
                  }}
                >
                  Login
                </ChakraLink>
                <Button as={ChakraLink} href="/signup" variant="cyber">
                  Sign Up
                </Button>
              </>
            )}
          </HStack>

          {/* Mobile Navigation */}
          <Box display={{ base: "block", md: "none" }}>
            <ChakraMenu>
              <ChakraMenuButton
                as={IconButton}
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                className="button-primary"
                variant="ghost"
                _hover={{ filter: "brightness(1.2)" }}
              />
              <ChakraMenuList className="modal" p={2}>
                <ChakraMenuItem
                  className="button-primary"
                  onClick={toggleColorMode}
                  mb={2}
                  icon={isDark ? <SunIcon /> : <MoonIcon />}
                >
                  {isDark ? "Light" : "Dark"} Mode
                </ChakraMenuItem>
                {user ? (
                  <>
                    <ChakraMenuItem
                      as={ChakraLink}
                      href="/prompts"
                      className="button-primary"
                      mb={2}
                    >
                      My Prompts
                    </ChakraMenuItem>
                    <ChakraMenuItem
                      className="button-primary"
                      onClick={() => router.push("/settings")}
                      mb={2}
                      icon={<SettingsIcon />}
                    >
                      Settings
                    </ChakraMenuItem>
                    <ChakraMenuItem
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                      color="red.400"
                      _hover={{
                        bg: "rgba(255, 0, 0, 0.1)",
                        color: "red.300",
                      }}
                      icon={<LockIcon />}
                    >
                      Logout
                    </ChakraMenuItem>
                  </>
                ) : (
                  <>
                    <ChakraMenuItem
                      as={ChakraLink}
                      href="/login"
                      color="whiteAlpha.900"
                      bg="space.navy"
                      _hover={{
                        bg: "rgba(0, 243, 255, 0.1)",
                        color: "neon.blue",
                      }}
                    >
                      Login
                    </ChakraMenuItem>
                    <ChakraMenuItem
                      as={ChakraLink}
                      href="/signup"
                      color="whiteAlpha.900"
                      bg="space.navy"
                      _hover={{
                        bg: "rgba(157, 0, 255, 0.1)",
                        color: "neon.purple",
                      }}
                    >
                      Sign Up
                    </ChakraMenuItem>
                  </>
                )}
              </ChakraMenuList>
            </ChakraMenu>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
