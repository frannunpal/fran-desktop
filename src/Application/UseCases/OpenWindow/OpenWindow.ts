import type { IWindowManager } from '@application/Ports/IWindowManager';
import type { WindowEntity, WindowInput } from '@domain/Entities/Window';

export const openWindow = (manager: IWindowManager, input: WindowInput): WindowEntity => {
  return manager.open(input);
};
