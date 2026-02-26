export interface AppEntry {
  id: string;
  name: string;
  icon: string;
  fcIcon?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  canMaximize?: boolean;
}
