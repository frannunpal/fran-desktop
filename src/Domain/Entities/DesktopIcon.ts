import type { DesktopIconEntity } from '@/Shared/Interfaces/IDesktopIcon';

export type DesktopIconInput = Omit<DesktopIconEntity, 'id'>;

export const createDesktopIcon = (input: DesktopIconInput): DesktopIconEntity => ({
  ...input,
  id: crypto.randomUUID(),
});
