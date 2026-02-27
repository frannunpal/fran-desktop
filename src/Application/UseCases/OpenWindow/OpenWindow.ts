import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';
import type { WindowInput } from '@domain/Entities/Window';
import type { WindowEntity } from "@/Shared/Interfaces/WindowEntity";

export const openWindow = (manager: IWindowManager, input: WindowInput): WindowEntity => {
  return manager.open(input);
};
