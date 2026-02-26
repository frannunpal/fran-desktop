import type { ReactNode, HTMLAttributes } from 'react';

// Minimal framer-motion mock: renders children without animations
export const motion = new Proxy(
  {},
  {
    get: (_target, tag: string) =>
      ({ children, ...props }: HTMLAttributes<HTMLElement> & { children?: ReactNode }) => {
        const Tag = tag as keyof JSX.IntrinsicElements;
        return <Tag {...(props as object)}>{children}</Tag>;
      },
  },
) as Record<string, React.FC<HTMLAttributes<HTMLElement> & { children?: ReactNode }>>;

export const AnimatePresence = ({ children }: { children: ReactNode }) => <>{children}</>;
