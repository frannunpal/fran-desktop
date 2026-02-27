import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

export const closeWindow = (manager: IWindowManager, id: string): void => {
  manager.close(id);
};
