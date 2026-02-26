import type { Transition, Variants } from 'framer-motion';

export const ANIMATION_DURATION = 0.4;

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

export const randomWindowPosition = (): { x: number; y: number } => ({
  x: 150 + Math.random() * 200,
  y: 80 + Math.random() * 100,
});
