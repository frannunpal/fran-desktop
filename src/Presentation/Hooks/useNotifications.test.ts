// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import type { NotificationItem } from '@/Shared/Interfaces/IDesktopState';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { useNotifications } = await import('./useNotifications');

const makeNotification = (overrides: Partial<NotificationItem> = {}): NotificationItem => ({
  id: 'test-notif',
  title: 'Test notification',
  message: 'Test message',
  ...overrides,
});

describe('useNotifications', () => {
  beforeEach(() => {
    useDesktopStore.setState({ notifications: [] });
  });

  it('should return an empty notifications array initially', () => {
    // Act
    const { result } = renderHook(() => useNotifications());

    // Assert
    expect(result.current.notifications).toHaveLength(0);
  });

  it('should return the notification after addNotification is called', () => {
    // Arrange
    const notif = makeNotification();

    // Act
    act(() => {
      useDesktopStore.getState().addNotification(notif);
    });
    const { result } = renderHook(() => useNotifications());

    // Assert
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('test-notif');
  });

  it('should remove the notification after removeNotification is called', () => {
    // Arrange
    const notif = makeNotification();
    act(() => {
      useDesktopStore.getState().addNotification(notif);
    });

    // Act
    act(() => {
      useDesktopStore.getState().removeNotification('test-notif');
    });
    const { result } = renderHook(() => useNotifications());

    // Assert
    expect(result.current.notifications).toHaveLength(0);
  });
});
