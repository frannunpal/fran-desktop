import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

export const resizeWindow = (
  manager: IWindowManager,
  id: string,
  width: number,
  height: number,
): void => {
  manager.resize(id, width, height);
};
