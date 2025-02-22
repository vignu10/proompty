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
    },
    space: {
      black: "#0A0B14",
      navy: "#0F1123",
    },
  },
  fonts: {
    heading: "'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  styles: {
    global: {
      body: {
        bg: "space.black",
        color: "whiteAlpha.900",
      },
    },
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
      baseStyle: {
        container: {
          backgroundColor: "rgba(15, 17, 35, 0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: "lg",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transition: "transform 0.2s ease-in-out",
          _hover: {
            transform: "translateY(-2px)",
          },
        },
      },
    },
    Input: {
      variants: {
        futuristic: {
          field: {
            bg: "space.navy",
            border: "1px solid",
            borderColor: "whiteAlpha.200",
            _focus: {
              borderColor: "neon.blue",
              boxShadow: "0 0 0 1px rgba(0, 243, 255, 0.3)",
            },
          },
        },
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
