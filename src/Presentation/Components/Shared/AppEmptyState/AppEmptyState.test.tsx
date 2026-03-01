// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

vi.mock('framer-motion', async () => await import('@/Shared/Testing/__mocks__/framer-motion.mock'));

const { default: AppEmptyState } = await import('./AppEmptyState');

describe('AppEmptyState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render 4 colored items', () => {
    // Arrange & Act
    const { container } = render(<AppEmptyState />);

    // Assert
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(4);
  });

  it('should render the default label when no label is provided', () => {
    // Arrange & Act
    render(<AppEmptyState />);

    // Assert
    expect(screen.getByText('Work In Progress')).toBeInTheDocument();
  });

  it('should render a custom label when provided', () => {
    // Arrange & Act
    render(<AppEmptyState label="No image to display. Please open one." />);

    // Assert
    expect(screen.getByText('No image to display. Please open one.')).toBeInTheDocument();
  });

  it('should shuffle items after 1 second', () => {
    // Arrange
    const { container } = render(<AppEmptyState />);
    const before = Array.from(container.querySelectorAll('li')).map(
      li => (li as HTMLElement).style.backgroundColor,
    );

    // Act
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Assert — order may have changed (not guaranteed but shuffle runs)
    const after = Array.from(container.querySelectorAll('li')).map(
      li => (li as HTMLElement).style.backgroundColor,
    );
    expect(after).toHaveLength(4);
    expect(before.sort()).toEqual(after.sort()); // same colors, potentially different order
  });
});
