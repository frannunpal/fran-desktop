import { createWindow } from '@domain/Entities/Window';
import type { WindowEntity, WindowInput } from '@domain/Entities/Window';
import type { IWindowManager } from '@application/Ports/IWindowManager';

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
    const window = this.windows.get(id);
    if (!window) return;
    this.windows.set(id, { ...window, state: 'minimized' });
  }

  maximize(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;
    this.windows.set(id, { ...window, state: 'maximized' });
  }

  restore(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;
    this.windows.set(id, { ...window, state: 'normal' });
  }

  focus(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;
    this.windows.set(id, { ...window, zIndex: this.nextZIndex++ });
  }

  move(id: string, x: number, y: number): void {
    const window = this.windows.get(id);
    if (!window) return;
    this.windows.set(id, { ...window, x, y });
  }

  resize(id: string, width: number, height: number): void {
    const window = this.windows.get(id);
    if (!window) return;
    this.windows.set(id, { ...window, width, height });
  }
}
