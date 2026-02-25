import type { IWindowManager } from '@application/Ports/IWindowManager';

export const resizeWindow = (
  manager: IWindowManager,
  id: string,
  width: number,
  height: number
): void => {
  manager.resize(id, width, height);
};
