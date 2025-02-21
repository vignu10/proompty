'use client';

import { Link as ChakraLink } from '@chakra-ui/next-js';
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { HamburgerIcon } from '@chakra-ui/icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex="sticky"
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Container maxW="7xl" py={4}>
        <Flex justify="space-between" align="center">
          <ChakraLink href="/" _hover={{ textDecoration: 'none' }}>
            <Heading size="lg" color="brand.500">
              PromptVault
            </Heading>
          </ChakraLink>

          {/* Desktop Navigation */}
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            {user ? (
              <>
                <ChakraLink
                  href="/prompts"
                  color="gray.700"
                  fontWeight="medium"
                  _hover={{ color: 'brand.500' }}
                >
                  My Prompts
                </ChakraLink>
                <Button
                  variant="ghost"
                  onClick={logout}
                  _hover={{ bg: 'brand.50', color: 'brand.500' }}
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
                  _hover={{ color: 'brand.500' }}
                >
                  Login
                </ChakraLink>
                <Button
                  as={ChakraLink}
                  href="/signup"
                  colorScheme="brand"
                  _hover={{ bg: 'brand.600' }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </HStack>

          {/* Mobile Navigation */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Menu"
                icon={<HamburgerIcon />}
                variant="ghost"
              />
              <MenuList>
                {user ? (
                  <>
                    <MenuItem as={ChakraLink} href="/prompts">
                      My Prompts
                    </MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem as={ChakraLink} href="/login">
                      Login
                    </MenuItem>
                    <MenuItem as={ChakraLink} href="/signup">
                      Sign Up
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
