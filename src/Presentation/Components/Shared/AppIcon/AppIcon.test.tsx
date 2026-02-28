// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@presentation/Hooks/useFcIcon', () => ({
  useFcIconElement: (name: string) => (name ? <svg data-testid="fc-icon" /> : null),
}));

const { default: AppIcon } = await import('./AppIcon');

describe('AppIcon', () => {
  it('should render the fc icon when fcIcon is provided', () => {
    // Arrange & Act
    render(<AppIcon fcIcon="FcEditImage" fallback="📝" />);

    // Assert
    expect(screen.getByTestId('fc-icon')).toBeInTheDocument();
    expect(screen.queryByText('📝')).not.toBeInTheDocument();
  });

  it('should render the fallback when fcIcon is absent', () => {
    // Arrange & Act
    render(<AppIcon fallback="📝" />);

    // Assert
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('should render nothing when both fcIcon and fallback are absent', () => {
    // Arrange & Act
    const { container } = render(<AppIcon />);

    // Assert
    expect(container.firstChild).toBeNull();
  });
});
