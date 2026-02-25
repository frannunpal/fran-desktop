import { describe, it, expect } from 'vitest';
import { createDesktopIconUseCase } from './CreateDesktopIcon';
import type { DesktopIconInput } from '@domain/Entities/DesktopIcon';

const baseInput: DesktopIconInput = {
  name: 'Terminal',
  icon: 'terminal.png',
  x: 20,
  y: 20,
  appId: 'terminal',
};

describe('createDesktopIconUseCase', () => {
  it('should return a desktop icon with the provided input values', () => {
    // Act
    const icon = createDesktopIconUseCase(baseInput);

    // Assert
    expect(icon.name).toBe('Terminal');
    expect(icon.icon).toBe('terminal.png');
    expect(icon.x).toBe(20);
    expect(icon.y).toBe(20);
    expect(icon.appId).toBe('terminal');
  });

  it('should generate a unique id for each icon', () => {
    // Act
    const icon1 = createDesktopIconUseCase(baseInput);
    const icon2 = createDesktopIconUseCase(baseInput);

    // Assert
    expect(icon1.id).not.toBe(icon2.id);
  });

  it('should generate a non-empty id', () => {
    // Act
    const icon = createDesktopIconUseCase(baseInput);

    // Assert
    expect(icon.id).toBeTruthy();
  });
});
