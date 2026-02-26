/**
 * Design Tokens for PromptVault
 * Centralized design system for consistent styling across all components
 */

// Color tokens - semantic naming for better maintainability
export const colors = {
  // Primary brand colors
  primary: {
    50: '#00f3ff', // neon blue
    100: '#00d4ff', // lighter blue
    500: '#0099ff', // dark blue
    600: '#0066cc', // darker blue
    900: '#003399', // darkest blue
  },

  // Accent colors
  accent: {
    purple: {
      50: '#9d00ff',
      100: '#b347ff',
      500: '#7c3aed',
      900: '#5a189a',
    },
    cyan: {
      50: '#00e5ff',
      500: '#06b6d4',
      900: '#0891b2',
    },
  },

  // Neutral colors
  neutral: {
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    navy: {
      50: '#0a192f',
      100: '#1e3a8a',
      500: '#172554',
      900: '#0f172a',
    },
  },

  // Semantic colors
  semantic: {
    success: {
      50: '#10b981',
      500: '#059669',
      900: '#047857',
    },
    warning: {
      50: '#f59e0b',
      500: '#d97706',
      900: '#b45309',
    },
    error: {
      50: '#ef4444',
      500: '#dc2626',
      900: '#991b1b',
    },
    info: {
      50: '#3b82f6',
      500: '#2563eb',
      900: '#1d4ed8',
    },
  },

  // Background colors
  background: {
    primary: '#0a192f', // space navy
    secondary: '#111827', // darker navy
    elevated: '#1e293b', // card background
    overlay: 'rgba(10, 15, 30, 0.85)', // subtle overlay
    glass: 'rgba(255, 255, 255, 0.1)', // glassmorphism
  },

  // Border colors
  border: {
    default: 'rgba(255, 255, 255, 0.2)',
    subtle: 'rgba(0, 243, 255, 0.15)',
    focus: 'rgba(0, 243, 255, 0.6)', // neon blue glow
    error: 'rgba(239, 68, 68, 0.9)',
  },

  // Text colors
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.9)',
    muted: 'rgba(255, 255, 255, 0.6)',
    inverted: 'rgba(10, 15, 30, 0.85)', // for glass cards
    onDark: 'rgba(255, 255, 255, 0.95)',
  },

  // Shadow tokens
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.2)',
    glow: '0 0 10px rgba(0, 243, 255, 0.4)', // neon glow effect
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  // Border radius
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '1rem',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    toast: 1200,
    navbar: 1000,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

// Individual exports for convenience
export const spacing = colors.spacing;
export const radius = colors.radius;
export const fontSize = colors.fontSize;
export const shadow = colors.shadow;
export const border = colors.border;
export const zIndex = colors.zIndex;
export const breakpoints = colors.breakpoints;

// Component-specific variants
export const buttonVariants = {
  primary: {
    default: {
      bg: colors.primary[50],
      color: colors.text.primary,
      _hover: {
        bg: colors.primary[100],
      },
    },
    subtle: {
      bg: 'transparent',
      border: '1px solid',
      borderColor: colors.border.default,
      color: colors.text.primary,
      _hover: {
        bg: 'rgba(0, 243, 255, 0.05)',
      },
    },
    ghost: {
      bg: 'transparent',
      color: colors.text.primary,
      _hover: {
        bg: 'rgba(0, 243, 255, 0.08)',
      },
    },
    cyber: {
      bg: colors.primary[50],
      color: colors.text.primary,
      border: '1px solid',
      borderColor: colors.border.focus,
      boxShadow: colors.shadow.glow,
      _hover: {
        bg: colors.primary[100],
        boxShadow: colors.shadow.md,
      },
      _active: {
        transform: 'scale(0.98)',
      },
    },
  } as const,
};

export const textStyles = {
  gradient: {
    bgGradient: 'linear(to-r, colors.primary[50], colors.accent.purple[500])',
    bgClip: 'text',
    fontWeight: 'bold',
    letterSpacing: 'tight',
  },
  inverted: {
    color: colors.text.inverted,
  },
  muted: {
    color: colors.text.muted,
  },
} as const;
