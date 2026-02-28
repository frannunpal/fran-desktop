import { createWindow } from '@domain/Entities/Window';
import type { WindowInput } from '@/Shared/Types/WindowTypes';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

/**
 * Z-index strategy:
 *
 *  - All windows share a single monotonic counter `nextZIndex`.
 *  - Normal windows get their raw counter value as zIndex.
 *  - AlwaysOnTop windows get `ALWAYS_ON_TOP_OFFSET + counter`, guaranteeing
 *    they are always rendered above every normal window regardless of focus order.
 *  - When a window is focused, the counter advances and the window receives the
 *    new top-of-stack value within its group. Normal windows cannot exceed
 *    ALWAYS_ON_TOP_OFFSET; alwaysOnTop windows are always ≥ ALWAYS_ON_TOP_OFFSET.
 *
 *  isFocused (computed in Window.tsx):
 *    A window is focused when its zIndex is the maximum among windows in its
 *    own group (normal OR alwaysOnTop), ignoring minimized windows.
 */
const ALWAYS_ON_TOP_OFFSET = 10_000;

export class WindowManagerAdapter implements IWindowManager {
  private windows: Map<string, WindowEntity> = new Map();
  private nextZIndex = 1;

  private assignZIndex(alwaysOnTop: boolean): number {
    const raw = this.nextZIndex++;
    return alwaysOnTop ? ALWAYS_ON_TOP_OFFSET + raw : raw;
  }

  reset(): void {
    this.windows.clear();
    this.nextZIndex = 1;
  }

  /**
   * Restores persisted windows into the adapter and synchronizes the
   * nextZIndex counter so that subsequent focus/open calls always produce
   * a value strictly higher than any already-persisted zIndex.
   */
  loadWindows(windows: WindowEntity[]): void {
    this.windows.clear();
    let maxZIndex = 0;
    for (const w of windows) {
      this.windows.set(w.id, w);
      // Strip the alwaysOnTop offset so we compare raw counter values
      const raw =
        (w.alwaysOnTop ?? false) ? w.zIndex - ALWAYS_ON_TOP_OFFSET : w.zIndex;
      if (raw > maxZIndex) maxZIndex = raw;
    }
    this.nextZIndex = maxZIndex + 1;
  }

  getAll(): WindowEntity[] {
    return Array.from(this.windows.values());
  }

  getById(id: string): WindowEntity | undefined {
    return this.windows.get(id);
  }

  open(input: WindowInput): WindowEntity {
    const window = createWindow(input);
    window.zIndex = this.assignZIndex(window.alwaysOnTop ?? false);
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
    const window = this.windows.get(id);
    if (!window) return;
    const newZIndex = this.assignZIndex(window.alwaysOnTop ?? false);
    this.updateWindow(id, { zIndex: newZIndex });
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
