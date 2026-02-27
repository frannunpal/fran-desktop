import { createWindow } from '@domain/Entities/Window';
import type { WindowInput } from '@/Shared/Types/WindowTypes';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

export class WindowManagerAdapter implements IWindowManager {
  private windows: Map<string, WindowEntity> = new Map();
  private nextZIndex = 1;

  getAll(): WindowEntity[] {
    return Array.from(this.windows.values());
  }

  getById(id: string): WindowEntity | undefined {
    return this.windows.get(id);
  }

  open(input: WindowInput): WindowEntity {
    const window = createWindow(input);
    window.zIndex = this.nextZIndex++;
    this.windows.set(window.id, window);
    return window;
  }

  close(id: string): void {
    this.windows.delete(id);
  }

  minimize(id: string): void {
    this.updateWindow(id, { state: 'minimized' });
  }

  maximize(id: string): void {
    this.updateWindow(id, { state: 'maximized' });
  }

  restore(id: string): void {
    this.updateWindow(id, { state: 'normal' });
  }

  focus(id: string): void {
    this.updateWindow(id, { zIndex: this.nextZIndex++ });
  }

  move(id: string, x: number, y: number): void {
    this.updateWindow(id, { x, y });
  }

  resize(id: string, width: number, height: number): void {
    this.updateWindow(id, { width, height });
  }

  private updateWindow(id: string, patch: Partial<WindowEntity>): void {
    const window = this.windows.get(id);
    if (!window) return;
    this.windows.set(id, { ...window, ...patch });
  }
}
