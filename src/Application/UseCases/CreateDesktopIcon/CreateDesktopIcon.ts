import { createDesktopIcon } from '@domain/Entities/DesktopIcon';
import type { DesktopIconInput } from '@domain/Entities/DesktopIcon';
import type { DesktopIconEntity } from "@/Shared/Interfaces/IDesktopIcon";

export const createDesktopIconUseCase = (input: DesktopIconInput): DesktopIconEntity => {
  return createDesktopIcon(input);
};
