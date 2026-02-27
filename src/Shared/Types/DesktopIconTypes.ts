import type { DesktopIconEntity } from '@/Shared/Interfaces/IDesktopIcon';

export type DesktopIconInput = Omit<DesktopIconEntity, 'id'>;
