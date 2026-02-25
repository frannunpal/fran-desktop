import type { IWindowManager } from '@application/Ports/IWindowManager';

export const closeWindow = (manager: IWindowManager, id: string): void => {
  manager.close(id);
};
