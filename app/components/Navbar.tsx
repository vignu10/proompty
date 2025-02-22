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
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import {
  HamburgerIcon,
  ChevronDownIcon,
  SettingsIcon,
  LockIcon,
} from "@chakra-ui/icons";

export default function Navbar() {
  const { user, logout } = useAuth();

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
          <HStack spacing={4} display={{ base: "none", md: "flex" }}>
            {user ? (
              <>
                <ChakraLink
                  href="/prompts"
                  color="whiteAlpha.900"
                  fontWeight="medium"
                  _hover={{
                    color: "neon.blue",
                    textShadow: "0 0 8px rgba(0, 243, 255, 0.5)",
                  }}
                >
                  My Prompts
                </ChakraLink>
                <ChakraMenu>
                  <ChakraMenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    variant="ghost"
                    color="whiteAlpha.900"
                    _hover={{
                      bg: "rgba(0, 243, 255, 0.1)",
                      color: "neon.blue",
                    }}
                  >
                    {user.name || user.email}
                  </ChakraMenuButton>
                  <ChakraMenuList
                    bg="space.navy"
                    borderColor="whiteAlpha.200"
                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
                    sx={{
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "md",
                        padding: "1px",
                        background: "linear-gradient(45deg, #00f3ff, #9d00ff)",
                        WebkitMask:
                          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      },
                    }}
                  >
                    <ChakraMenuItem
                      as={ChakraLink}
                      href="/profile"
                      color="whiteAlpha.900"
                      bg="space.navy"
                      icon={<SettingsIcon />}
                      _hover={{
                        bg: "rgba(0, 243, 255, 0.1)",
                        color: "neon.blue",
                      }}
                    >
                      Profile Settings
                    </ChakraMenuItem>
                    <ChakraMenuItem
                      onClick={logout}
                      color="whiteAlpha.900"
                      bg="space.navy"
                      icon={<LockIcon />}
                      _hover={{
                        bg: "rgba(0, 243, 255, 0.1)",
                        color: "neon.blue",
                      }}
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
                variant="ghost"
                color="whiteAlpha.900"
                _hover={{
                  bg: "rgba(0, 243, 255, 0.1)",
                  color: "neon.blue",
                }}
              />
              <ChakraMenuList
                bg="space.navy"
                borderColor="whiteAlpha.200"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
                sx={{
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "md",
                    padding: "1px",
                    background: "linear-gradient(45deg, #00f3ff, #9d00ff)",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  },
                }}
              >
                {user ? (
                  <>
                    <ChakraMenuItem
                      as={ChakraLink}
                      href="/prompts"
                      color="whiteAlpha.900"
                      bg="space.navy"
                      _hover={{
                        bg: "rgba(0, 243, 255, 0.1)",
                        color: "neon.blue",
                      }}
                    >
                      My Prompts
                    </ChakraMenuItem>
                    <ChakraMenuItem
                      onClick={logout}
                      color="whiteAlpha.900"
                      bg="space.navy"
                      _hover={{
                        bg: "rgba(157, 0, 255, 0.1)",
                        color: "neon.purple",
                      }}
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
