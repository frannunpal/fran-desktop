import type { ReactNode, FC } from 'react';
import { vi } from 'vitest';

interface ItemProps {
  children: ReactNode;
  onClick?: (params: { props?: Record<string, unknown> }) => void;
  disabled?: boolean;
  'data-windowid'?: string;
}

export const Menu: FC<{ id: string; children: ReactNode }> = ({ id, children }) => (
  <div data-testid={`context-menu-${id}`}>{children}</div>
);

export const Item: FC<ItemProps> = ({ children, onClick, disabled, 'data-windowid': windowId }) => (
  <button onClick={() => onClick?.({ props: windowId ? { windowId } : {} })} disabled={disabled}>
    {children}
  </button>
);

export const Separator: FC = () => <hr />;

export const useContextMenu = (params: { id: string }) => ({
  show: vi.fn((opts: { event: Event }) => opts),
  hideAll: vi.fn(),
  id: params.id,
});
