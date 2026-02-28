import { vi } from 'vitest';
import type { ReactNode, HTMLAttributes, ElementType } from 'react';

// Minimal framer-motion mock: renders children without animations
// Strip framer-motion-specific props that are not valid DOM attributes
const MOTION_PROPS = new Set([
  'variants',
  'initial',
  'animate',
  'exit',
  'layout',
  'transition',
  'whileHover',
  'whileTap',
  'whileFocus',
]);

// eslint-disable-next-line react-refresh/only-export-components
export const motion = new Proxy(
  {},
  {
    get:
      (_target, tag: string) =>
      ({ children, ...props }: HTMLAttributes<HTMLElement> & { children?: ReactNode }) => {
        const Tag = tag as ElementType;
        const domProps = Object.fromEntries(
          Object.entries(props).filter(([k]) => !MOTION_PROPS.has(k)),
        );
        return <Tag {...(domProps as object)}>{children}</Tag>;
      },
  },
) as Record<string, React.FC<HTMLAttributes<HTMLElement> & { children?: ReactNode }>>;

export const AnimatePresence = ({ children }: { children: ReactNode }) => <>{children}</>;

// useAnimationControls: returns a controls object whose start() resolves immediately
// eslint-disable-next-line react-refresh/only-export-components
export const useAnimationControls = () => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  set: vi.fn(),
});
