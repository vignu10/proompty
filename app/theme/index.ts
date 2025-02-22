import { extendTheme } from '@chakra-ui/react';

const colors = {
  space: {
    navy: '#0A0F1C',
    black: '#050810',
  },
  neon: {
    blue: '#00F3FF',
    purple: '#9D00FF',
    cyan: '#00FFF2',
  },
};

const fonts = {
  heading: '"Exo 2", sans-serif',
  body: '"Inter", sans-serif',
};

const components = {
  Button: {
    variants: {
      cyber: {
        bg: 'space.navy',
        color: 'whiteAlpha.900',
        border: '1px solid',
        borderColor: 'neon.blue',
        _hover: {
          bg: 'rgba(0, 243, 255, 0.1)',
          boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)',
          transform: 'translateY(-2px)',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.3s ease',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'space.navy',
        borderRadius: 'xl',
        position: 'relative',
        overflow: 'hidden',
        _before: {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'xl',
          padding: '2px',
          background: 'linear-gradient(45deg, #00f3ff, #9d00ff)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        },
      },
    },
  },
  Input: {
    variants: {
      cyber: {
        field: {
          bg: 'space.navy',
          border: '1px solid',
          borderColor: 'neon.blue',
          color: 'whiteAlpha.900',
          _hover: {
            borderColor: 'neon.purple',
          },
          _focus: {
            borderColor: 'neon.purple',
            boxShadow: '0 0 0 1px var(--chakra-colors-neon-purple)',
          },
        },
      },
    },
    defaultProps: {
      variant: 'cyber',
    },
  },
};

const styles = {
  global: {
    body: {
      bg: 'space.black',
      color: 'whiteAlpha.900',
    },
    '::-webkit-scrollbar': {
      width: '10px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'space.navy',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'neon.blue',
      borderRadius: 'full',
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export default theme;
