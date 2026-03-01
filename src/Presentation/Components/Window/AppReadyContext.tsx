import { useRef, useCallback, type FC, type ReactNode } from 'react';
import { AppReadyContext } from './useAppReady';

export const AppReadyProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const contentDataRef = useRef<Record<string, unknown> | undefined>(undefined);

  const notifyReady = useCallback((contentData?: Record<string, unknown>) => {
    if (contentData !== undefined) {
      contentDataRef.current = contentData;
    }
  }, []);

  const getContentData = useCallback(() => contentDataRef.current, []);

  return (
    <AppReadyContext.Provider value={{ notifyReady, getContentData }}>
      {children}
    </AppReadyContext.Provider>
  );
};
