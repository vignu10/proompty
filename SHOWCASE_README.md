# Immersive 3D Landing Page

An Awwwards-level landing page built with Next.js 14, React Three Fiber, GSAP, and Lenis smooth scrolling.

## Features

- **Smooth Scrolling**: Lenis integration for buttery smooth inertial scrolling
- **3D Typography**: Interactive 3D text that responds to scroll position
- **Scroll-Driven Animation**: Camera moves along a path based on scroll progress
- **HTML Overlay**: Framer Motion-powered text reveal animations
- **Dark Mode**: Minimalist dark theme with electric purple accents
- **Performance Optimized**: DPR capping, lazy loading, and efficient rendering

## Required Dependencies

Install the following packages:

```bash
# Core 3D & Animation
npm install @react-three/fiber @react-three/drei @react-three/postprocessing three

# Smooth Scrolling
npm install @studio-freight/react-lenis

# Animation
npm install framer-motion

# Math helpers
npm install maath

# Font loading (optional, for Type 3D fonts)
npm install @types/three @types/three-stdlib
```

## Setup Instructions

### 1. Download 3D Font

You need a JSON 3D font file. Download **Inter_Bold.json** from:

- [Helvetiker Regular (default)](https://threejs.org/examples/fonts/helvetiker_regular.typeface.json)
- Or use [Font Generator](https://gero3.github.io/facetype.js/) to convert any font to JSON

Place the file in: `public/fonts/Inter_Bold.json`

### 2. File Structure

```
app/
├── components/
│   ├── providers/
│   │   └── LenisProvider.tsx    # Smooth scroll wrapper
│   ├── r3f/
│   │   ├── Scene.tsx            # Main Canvas component
│   │   ├── Experience.tsx       # 3D scene logic
│   │   └── Text3D.tsx           # Reusable 3D typography
│   └── Section.tsx              # HTML overlay sections with animations
├── showcase/
│   ├── layout.tsx               # Layout with Lenis provider
│   └── page.tsx                 # Main showcase page
├── globals.css                  # Global styles + Lenis styles
└── lib/
```

### 3. View the Showcase

Navigate to `/showcase` route to see the landing page:

```bash
npm run dev
# Visit http://localhost:3000/showcase
```

## Component Breakdown

### `LenisProvider.tsx`
Wraps the app with Lenis smooth scrolling. Configures:
- Duration: 1.2s
- Easing: Custom exponential curve
- Vertical gesture direction

### `Scene.tsx`
The R3F Canvas component with:
- DPR capping [1, 2] for performance
- ACES Filmic tone mapping
- Fixed positioning as background
- ScrollControls for scrollytelling

### `Experience.tsx`
Main 3D scene containing:
- **Lighting**: Ambient, directional, point, and spot lights
- **Environment**: City preset for reflections
- **3D Text**: "CREATIVE TECHNOLOGY REIMAGINED" with floating animation
- **Background**: Torus knot with MeshDistortMaterial
- **Particles**: Floating purple particles
- **Camera**: Moves in circular path based on scroll offset

### `Text3D.tsx`
Reusable 3D typography component with:
- Custom font loading via @react-three/drei
- Floating animation (sin/cos waves)
- Scroll-reactive rotation
- Metallic material with environment reflections

### `Section.tsx`
HTML overlay components with:
- Framer Motion useInView for reveal animations
- Staggered word-by-word text animation
- Configurable delay and easing

### `page.tsx`
Main page with 4 scroll sections:
1. **Hero**: Title with scroll indicator
2. **About**: Feature cards grid
3. **Features**: Tech stack showcase
4. **CTA**: Call to action button

## Customization

### Colors
Edit the theme in `page.tsx`:
- Background: `#0a0a0a`
- Accent: Purple `#8b5cf6` to Pink gradient
- Text: White/Gray scale

### 3D Content
Modify `Experience.tsx` to:
- Change text content
- Add more 3D objects
- Adjust camera path
- Modify lighting setup

### Scroll Duration
Edit `ScrollControls` in `Scene.tsx`:
```tsx
<ScrollControls pages={4} damping={0.3}>
```

### Animation Timing
Adjust easing functions in `Experience.tsx`:
```tsx
easing.damp3(state.camera.position, [...], 0.5, delta)
```

## Performance Tips

1. **DPR Capping**: Already set to `[1, 2]` max
2. **Lazy Loading**: Suspense boundary around Experience
3. **Geometry Reuse**: Share geometries when possible
4. **Material Instancing**: Use `instancedMesh` for many objects
5. **Font Size**: Keep JSON fonts under 500KB

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with WebGL 2.0

## Credits

- **Three.js**: 3D rendering engine
- **React Three Fiber**: React renderer for Three.js
- **Lenis**: Smooth scrolling library
- **Framer Motion**: Animation library
- **Drei**: Helpful helpers for R3F
