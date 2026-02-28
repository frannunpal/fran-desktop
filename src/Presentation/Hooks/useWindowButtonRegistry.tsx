import { createContext, useContext, useRef, type FC, type ReactNode } from 'react';

interface RegistryContextValue {
  register: (id: string, rect: DOMRect) => void;
  unregister: (id: string) => void;
  getRect: (id: string) => DOMRect | undefined;
}

const RegistryContext = createContext<RegistryContextValue | null>(null);

export const WindowButtonRegistryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const registry = useRef<Map<string, DOMRect>>(new Map());

  const register = (id: string, rect: DOMRect) => {
    registry.current.set(id, rect);
  };

  const unregister = (id: string) => {
    registry.current.delete(id);
  };

  const getRect = (id: string): DOMRect | undefined => {
    return registry.current.get(id);
  };

  return (
    <RegistryContext.Provider value={{ register, unregister, getRect }}>
      {children}
    </RegistryContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWindowButtonRegistry = (): RegistryContextValue => {
  const ctx = useContext(RegistryContext);
  if (!ctx)
    throw new Error('useWindowButtonRegistry must be used within WindowButtonRegistryProvider');
  return ctx;
};
