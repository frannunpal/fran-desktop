import { createContext, useContext } from 'react';

export interface AppReadyContextValue {
  notifyReady: (contentData?: Record<string, unknown>) => void;
  getContentData: () => Record<string, unknown> | undefined;
}

export const defaultAppReadyValue: AppReadyContextValue = {
  notifyReady: () => {},
  getContentData: () => undefined,
};

export const AppReadyContext = createContext<AppReadyContextValue>(defaultAppReadyValue);

export const useAppReady = (): AppReadyContextValue => {
  return useContext(AppReadyContext);
};
