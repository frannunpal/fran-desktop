// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContextMenu } from './useContextMenu';

const makeMouseEvent = (x: number, y: number) =>
  ({ preventDefault: () => {}, clientX: x, clientY: y }) as unknown as MouseEvent &
    React.MouseEvent;

describe('useContextMenu', () => {
  it('should initialize with closed state and zero position', () => {
    // Arrange & Act
    const { result } = renderHook(() => useContextMenu());

    // Assert
    expect(result.current.opened).toBe(false);
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it('should open with position from mouse event', () => {
    // Arrange
    const { result } = renderHook(() => useContextMenu());

    // Act
    act(() => {
      result.current.open(makeMouseEvent(120, 300));
    });

    // Assert
    expect(result.current.opened).toBe(true);
    expect(result.current.position).toEqual({ x: 120, y: 300 });
  });

  it('should apply offsetY when provided at hook level', () => {
    // Arrange
    const { result } = renderHook(() => useContextMenu(-8));

    // Act
    act(() => {
      result.current.open(makeMouseEvent(50, 200));
    });

    // Assert
    expect(result.current.position).toEqual({ x: 50, y: 192 });
  });

  it('should close when close is called', () => {
    // Arrange
    const { result } = renderHook(() => useContextMenu());
    act(() => {
      result.current.open(makeMouseEvent(10, 10));
    });

    // Act
    act(() => {
      result.current.close();
    });

    // Assert
    expect(result.current.opened).toBe(false);
  });

  it('should update position on subsequent opens', () => {
    // Arrange
    const { result } = renderHook(() => useContextMenu());
    act(() => {
      result.current.open(makeMouseEvent(10, 20));
    });

    // Act
    act(() => {
      result.current.open(makeMouseEvent(300, 400));
    });

    // Assert
    expect(result.current.position).toEqual({ x: 300, y: 400 });
  });
});
