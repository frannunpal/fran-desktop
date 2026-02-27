import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

export const minimizeWindow = (manager: IWindowManager, id: string): void => {
  manager.minimize(id);
};
