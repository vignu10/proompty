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
import { HamburgerIcon } from "@chakra-ui/icons";

export default function Navbar() {
  const { user, logout } = useAuth();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center">
          <ChakraLink href="/" _hover={{ textDecoration: "none" }}>
            <Heading size="lg" color="brand.500">
              PromptVault
            </Heading>
          </ChakraLink>

          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: "none", md: "flex" }}>
            {user ? (
              <>
                <ChakraLink
                  href="/prompts"
                  color="gray.700"
                  fontWeight="medium"
                  _hover={{ color: "brand.500" }}
                >
                  My Prompts
                </ChakraLink>
                <Button
                  variant="ghost"
                  onClick={logout}
                  _hover={{ bg: "brand.50", color: "brand.500" }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <ChakraLink
                  href="/login"
                  color="gray.700"
                  fontWeight="medium"
                  _hover={{ color: "brand.500" }}
                >
                  Login
                </ChakraLink>
                <Button
                  as={ChakraLink}
                  href="/signup"
                  colorScheme="brand"
                  _hover={{ bg: "brand.600" }}
                >
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
              />
              <ChakraMenuList>
                {user ? (
                  <>
                    <ChakraMenuItem as={ChakraLink} href="/prompts">
                      My Prompts
                    </ChakraMenuItem>
                    <ChakraMenuItem onClick={logout}>Logout</ChakraMenuItem>
                  </>
                ) : (
                  <>
                    <ChakraMenuItem as={ChakraLink} href="/login">
                      Login
                    </ChakraMenuItem>
                    <ChakraMenuItem as={ChakraLink} href="/signup">
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
