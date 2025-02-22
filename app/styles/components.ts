import { keyframes } from '@emotion/react';

export const glowKeyframes = keyframes`
  0% { text-shadow: 0 0 10px rgba(0, 243, 255, 0.3); }
  50% { text-shadow: 0 0 20px rgba(157, 0, 255, 0.5); }
  100% { text-shadow: 0 0 10px rgba(0, 243, 255, 0.3); }
`;

export const featureCardStyles = {
  container: {
    bg: 'space.navy',
    borderRadius: 'xl',
  },
  wrapper: {
    spacing: 6,
    p: 8,
    pos: 'relative' as const,
    _before: {
      content: '""',
      pos: 'absolute' as const,
      inset: 0,
      borderRadius: 'xl',
      padding: '2px',
      background: 'linear-gradient(45deg, #00f3ff, #9d00ff)',
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
    },
  },
  iconBox: {
    w: 12,
    h: 12,
    borderRadius: 'xl',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pos: 'relative' as const,
  },
};

export const gradientTextStyles = {
  bgGradient: 'linear(to-r, neon.blue, neon.purple)',
  bgClip: 'text',
  fontWeight: 'bold',
  letterSpacing: 'tight',
};

export const containerStyles = {
  maxW: { base: 'xl', lg: '7xl' },
  px: { base: 4, sm: 6, lg: 8 },
  py: { base: 16, sm: 20, lg: 28 },
};
