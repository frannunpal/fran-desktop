import type { FC } from 'react';
import type { WindowEntity } from './WindowEntity';
import type { AppMenuElement } from './IAppMenuElement';

export interface WindowContentProps {
  window?: WindowEntity;
  notifyReady?: (contentData?: Record<string, unknown>) => void;
}

export type AppComponent = FC<WindowContentProps>;

export type MenuBarBuilder = (window: WindowEntity) => AppMenuElement[] | undefined;

export interface AppRegistration {
  component: AppComponent;
  buildMenuBar?: MenuBarBuilder;
}
