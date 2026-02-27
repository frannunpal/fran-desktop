import type { DesktopIconEntity } from '@/Shared/Interfaces/IDesktopIcon';
export type { DesktopIconInput } from '@/Shared/Types/DesktopIconTypes';
import type { DesktopIconInput } from '@/Shared/Types/DesktopIconTypes';

export const createDesktopIcon = (input: DesktopIconInput): DesktopIconEntity => ({
  ...input,
  id: crypto.randomUUID(),
});
