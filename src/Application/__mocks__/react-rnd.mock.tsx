import type { ReactNode } from 'react';

export const Rnd = ({
  children,
  onMouseDown,
}: {
  children: ReactNode;
  onMouseDown?: () => void;
}) => (
  <div data-testid="rnd-container" onMouseDown={onMouseDown}>
    {children}
  </div>
);
