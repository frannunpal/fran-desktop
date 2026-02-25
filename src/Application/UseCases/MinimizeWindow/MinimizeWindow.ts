import type { IWindowManager } from '@application/Ports/IWindowManager';

export const minimizeWindow = (manager: IWindowManager, id: string): void => {
  manager.minimize(id);
};
