// src/utils/animations.js

// ============================================
// ENTRANCE ANIMATIONS
// ============================================
export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -40,
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1]
    }
  }
}

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      ease: [0.23, 1, 0.32, 1]
    }
  }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1]
    }
  }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1]
    }
  }
}

export const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1]
    }
  }
}

export const hoverScale = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  tap: { 
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  }
}

export const floating = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// ============================================
// CINEMATIC CARD VARIANTS
// ============================================
export const cardWithGlow = {
  rest: {
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    transition: { duration: 0.4 }
  },
  hover: {
    boxShadow: '0 8px 48px rgba(245,158,11,0.15)',
    y: -4,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
}

export const numberCountUp = {
  initial: { opacity: 0, scale: 0.5 },
  animate: (custom) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: custom * 0.05,
      duration: 0.6,
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  })
}