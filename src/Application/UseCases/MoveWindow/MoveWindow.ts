import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

export const moveWindow = (manager: IWindowManager, id: string, x: number, y: number): void => {
  manager.move(id, x, y);
};
