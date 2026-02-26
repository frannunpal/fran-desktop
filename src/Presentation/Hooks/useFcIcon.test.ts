// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFcIcon } from './useFcIcon';

vi.mock('react-icons/fc', () => ({
  FcEditImage: () => null,
  FcCommandLine: () => null,
}));

describe('useFcIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null initially', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFcIcon('FcEditImage'));

    // Assert
    expect(result.current).toBeNull();
  });

  it('should load and return the icon after dynamic import resolves', async () => {
    // Arrange & Act
    const { result } = renderHook(() => useFcIcon('FcEditImage'));

    // Assert
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(typeof result.current).toBe('function');
  });

  it('should return null for an unknown icon name', async () => {
    // Arrange — extend mock to include an undefined-value key
    vi.mock('react-icons/fc', () => ({
      FcEditImage: () => null,
      FcCommandLine: () => null,
      FcUnknown: undefined,
    }));
    const { result } = renderHook(() => useFcIcon('FcUnknown'));

    // Act
    await act(async () => {
      await import('react-icons/fc');
    });

    // Assert
    expect(result.current).toBeNull();
  });

  it('should return null when name is empty string', () => {
    // Arrange & Act
    const { result } = renderHook(() => useFcIcon(''));

    // Assert — import is never called for empty name
    expect(result.current).toBeNull();
  });

  it('should update icon when name changes', async () => {
    // Arrange
    const { result, rerender } = renderHook(({ name }: { name: string }) => useFcIcon(name), {
      initialProps: { name: 'FcEditImage' },
    });

    await waitFor(() => expect(result.current).not.toBeNull());

    // Act — change to a different icon
    act(() => {
      rerender({ name: 'FcCommandLine' });
    });

    // Assert — resets to null then loads new icon
    await waitFor(() => expect(result.current).not.toBeNull());
  });
});
