// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppReadyProvider } from './AppReadyContext';
import { useAppReady } from './useAppReady';

// Helper component that calls notifyReady on button click
const TestConsumer = ({ onNotify }: { onNotify?: () => void }) => {
  const { notifyReady } = useAppReady();
  return (
    <button
      onClick={() => {
        notifyReady();
        onNotify?.();
      }}
    >
      Notify
    </button>
  );
};

describe('AppReadyContext', () => {
  describe('default context', () => {
    it('should provide a notifyReady function that does not throw when called outside provider', () => {
      // Arrange — render without AppReadyProvider (uses default context value)
      const TestNoProvider = () => {
        const { notifyReady } = useAppReady();
        return <button onClick={() => notifyReady()}>Notify</button>;
      };

      render(<TestNoProvider />);

      // Act & Assert — should not throw
      expect(() => fireEvent.click(screen.getByRole('button', { name: 'Notify' }))).not.toThrow();
    });
  });

  describe('AppReadyProvider', () => {
    it('should render children', () => {
      // Act
      render(
        <AppReadyProvider>
          <span data-testid="child">child</span>
        </AppReadyProvider>,
      );

      // Assert
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should provide notifyReady to consumers via useAppReady', () => {
      // Arrange
      const onNotify = vi.fn();

      render(
        <AppReadyProvider>
          <TestConsumer onNotify={onNotify} />
        </AppReadyProvider>,
      );

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'Notify' }));

      // Assert
      expect(onNotify).toHaveBeenCalledOnce();
    });

    it('should not throw when notifyReady is called multiple times', () => {
      // Arrange
      render(
        <AppReadyProvider>
          <TestConsumer />
        </AppReadyProvider>,
      );

      const button = screen.getByRole('button', { name: 'Notify' });

      // Act & Assert — multiple calls should not throw
      expect(() => {
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);
      }).not.toThrow();
    });
  });
});
