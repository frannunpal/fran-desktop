export interface DesktopIconEntity {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  appId: string; // identifier of the app to open
}

export type DesktopIconInput = Omit<DesktopIconEntity, 'id'>;

export const createDesktopIcon = (input: DesktopIconInput): DesktopIconEntity => ({
  ...input,
  id: crypto.randomUUID(),
});
