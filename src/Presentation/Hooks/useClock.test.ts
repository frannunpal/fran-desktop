// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const { useClock } = await import('./useClock');

describe('useClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-25T10:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the current time as a formatted string', () => {
    // Act
    const { result } = renderHook(() => useClock());

    // Assert — matches HH:MM or HH:MM AM/PM
    expect(result.current).toMatch(/^\d{1,2}:\d{2}/);
  });

  it('should update the time every second', () => {
    // Act
    const { result } = renderHook(() => useClock());
    const initial = result.current;

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // Assert — time must have changed
    expect(result.current).not.toBe(initial);
  });

  it('should clear the interval on unmount', () => {
    // Arrange
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useClock());

    // Act
    unmount();

    // Assert
    expect(clearSpy).toHaveBeenCalled();
  });
});
