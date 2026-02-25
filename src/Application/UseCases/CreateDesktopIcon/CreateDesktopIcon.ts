import { createDesktopIcon } from '@domain/Entities/DesktopIcon';
import type { DesktopIconEntity, DesktopIconInput } from '@domain/Entities/DesktopIcon';

export const createDesktopIconUseCase = (input: DesktopIconInput): DesktopIconEntity => {
  return createDesktopIcon(input);
};
