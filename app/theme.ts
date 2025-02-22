import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Enable color mode config
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#E0F4FF",
      100: "#B8E3FF",
      200: "#85C9FF",
      300: "#52AFFF",
      400: "#2196FF",
      500: "#007DFF",
      600: "#0062DB",
      700: "#0049B7",
      800: "#003293",
      900: "#001C7A",
    },
    neon: {
      blue: "#00f3ff",
      purple: "#9d00ff",
      cyan: "#00fff2",
      pink: "#ff00f7",
    },
    space: {
      black: "#0A0B14",
      navy: "#0F1123",
      deepBlue: "#141832",
    },
  },
  fonts: {
    heading:
      "'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  styles: {
    global: (props: { colorMode: "light" | "dark" }) => ({
      body: {
        bg: props.colorMode === "dark" ? "space.black" : "gray.50",
        color: props.colorMode === "dark" ? "whiteAlpha.900" : "gray.800",
        transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
      },
      "::selection": {
        background: props.colorMode === "dark" ? "brand.500" : "brand.200",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        _hover: {
          transform: "scale(1.02)",
          transition: "all 0.2s ease-in-out",
        },
      },
      variants: {
        neon: {
          bg: "transparent",
          border: "1px solid",
          borderColor: "neon.blue",
          color: "neon.blue",
          boxShadow: "0 0 10px rgba(0, 243, 255, 0.3)",
          _hover: {
            boxShadow: "0 0 20px rgba(0, 243, 255, 0.5)",
            bg: "rgba(0, 243, 255, 0.1)",
          },
        },
        cyber: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.400",
            _before: {
              opacity: 1,
            },
          },
          _before: {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "md",
            opacity: 0,
            transition: "opacity 0.2s",
            boxShadow: "0 0 15px rgba(0, 125, 255, 0.5)",
          },
        },
      },
    },
    Card: {
      baseStyle: (props: { colorMode: "light" | "dark" }) => ({
        container: {
          backgroundColor:
            props.colorMode === "dark" ? "space.deepBlue" : "white",
          backdropFilter: "blur(10px)",
          borderRadius: "lg",
          border: `1px solid ${
            props.colorMode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)"
          }`,
          boxShadow:
            props.colorMode === "dark"
              ? "0 4px 20px rgba(0, 243, 255, 0.1)"
              : "0 2px 8px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
          _hover: {
            transform: "translateY(-2px)",
            boxShadow: props.colorMode === "dark"
              ? "0 8px 30px rgba(0, 243, 255, 0.15)"
              : "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        },
      }),
    },
    Input: {
      variants: {
        futuristic: (props: { colorMode: "light" | "dark" }) => ({
          field: {
            bg: props.colorMode === "dark" ? "space.navy" : "white",
            border: "1px solid",
            borderColor: props.colorMode === "dark" ? "whiteAlpha.200" : "gray.200",
            color: props.colorMode === "dark" ? "white" : "gray.800",
            transition: "all 0.2s ease-in-out",
            _placeholder: {
              color: props.colorMode === "dark" ? "whiteAlpha.400" : "gray.400",
            },
            _hover: {
              borderColor: props.colorMode === "dark" ? "whiteAlpha.300" : "gray.300",
            },
            _focus: {
              borderColor: "neon.blue",
              boxShadow: "0 0 0 1px rgba(0, 243, 255, 0.3)",
            },
          },
        }),
      },
      defaultProps: {
        variant: "futuristic",
      },
    },
    Textarea: {
      variants: {
        futuristic: {
          bg: "space.navy",
          border: "1px solid",
          borderColor: "whiteAlpha.200",
          _focus: {
            borderColor: "neon.blue",
            boxShadow: "0 0 0 1px rgba(0, 243, 255, 0.3)",
          },
        },
      },
      defaultProps: {
        variant: "futuristic",
      },
    },
  },
});

export default theme;
