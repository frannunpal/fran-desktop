// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WindowButtonRegistryProvider, useWindowButtonRegistry } from './useWindowButtonRegistry';

const makeDOMRect = (x: number, y: number, width = 120, height = 36): DOMRect => ({
  x,
  y,
  left: x,
  top: y,
  right: x + width,
  bottom: y + height,
  width,
  height,
  toJSON: () => ({}),
});

describe('useWindowButtonRegistry', () => {
  it('should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useWindowButtonRegistry());
    }).toThrow('useWindowButtonRegistry must be used within WindowButtonRegistryProvider');
  });

  it('should return undefined for unregistered id', () => {
    // Arrange & Act
    const { result } = renderHook(() => useWindowButtonRegistry(), {
      wrapper: WindowButtonRegistryProvider,
    });

    // Assert
    expect(result.current.getRect('unknown-id')).toBeUndefined();
  });

  it('should register and retrieve a rect', () => {
    // Arrange
    const { result } = renderHook(() => useWindowButtonRegistry(), {
      wrapper: WindowButtonRegistryProvider,
    });
    const rect = makeDOMRect(100, 200);

    // Act
    act(() => result.current.register('win-1', rect));

    // Assert
    expect(result.current.getRect('win-1')).toBe(rect);
  });

  it('should unregister a rect', () => {
    // Arrange
    const { result } = renderHook(() => useWindowButtonRegistry(), {
      wrapper: WindowButtonRegistryProvider,
    });
    const rect = makeDOMRect(50, 50);
    act(() => result.current.register('win-2', rect));

    // Act
    act(() => result.current.unregister('win-2'));

    // Assert
    expect(result.current.getRect('win-2')).toBeUndefined();
  });

  it('should overwrite rect on re-register', () => {
    // Arrange
    const { result } = renderHook(() => useWindowButtonRegistry(), {
      wrapper: WindowButtonRegistryProvider,
    });
    const rect1 = makeDOMRect(10, 10);
    const rect2 = makeDOMRect(200, 300);
    act(() => result.current.register('win-3', rect1));

    // Act
    act(() => result.current.register('win-3', rect2));

    // Assert
    expect(result.current.getRect('win-3')).toBe(rect2);
  });
});
