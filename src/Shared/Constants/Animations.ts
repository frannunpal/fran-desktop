import type { Transition, Variants, TargetAndTransition } from 'framer-motion';

export const ANIMATION_DURATION = 0.3;

export const EASE_IN: Transition = { duration: ANIMATION_DURATION, ease: 'easeIn' };
export const EASE_OUT: Transition = { duration: ANIMATION_DURATION, ease: 'easeOut' };

export const windowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: EASE_OUT },
  exit: { opacity: 0, scale: 0.92, y: 12, transition: EASE_IN },
};

export const panelVariants = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: EASE_OUT },
  exit: { opacity: 0, y: 8, scale: 0.96, transition: EASE_IN },
};

// Dynamic minimize: animates window toward its taskbar button position
export const minimizeVariant = (deltaX: number, deltaY: number): TargetAndTransition => ({
  opacity: 0,
  scale: 0.1,
  x: deltaX,
  y: deltaY,
  transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
});

// Dynamic restore: animates window from its taskbar button back to its position.
// Starts at the button (deltaX/deltaY offset) and flies to origin (0,0 = window position).
export const restoreVariant = (deltaX: number, deltaY: number): TargetAndTransition => ({
  opacity: [0, 1],
  scale: [0.1, 1],
  x: [deltaX, 0],
  y: [deltaY, 0],
  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
});

// Alternative open animations (available for Settings customization):
// - 'scale': current default, scales up from center with slight vertical offset
// - 'slide': slides in from bottom
// - 'fade': simple opacity fade
export const openVariants = {
  scale: {
    hidden: { opacity: 0, scale: 0.92, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0, transition: EASE_OUT },
  },
  slide: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: EASE_OUT },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: EASE_OUT },
  },
} as const;

// Transition for maximize/restore layout animations
export const maximizeTransition: Transition = { duration: 0.25, ease: 'easeOut' };

export const randomWindowPosition = (): { x: number; y: number } => ({
  x: 150 + Math.random() * 200,
  y: 80 + Math.random() * 100,
});
