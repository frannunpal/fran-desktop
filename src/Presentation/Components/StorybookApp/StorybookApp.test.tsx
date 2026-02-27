// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

const { default: StorybookApp } = await import('./StorybookApp');

describe('StorybookApp', () => {
  it('should render an iframe pointing to the Storybook URL', () => {
    // Act
    render(<StorybookApp />);

    // Assert
    const iframe = screen.getByTitle('Storybook');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://frannunpal.github.io/fran-desktop/storybook/');
  });

  it('should have an accessible label', () => {
    // Act
    render(<StorybookApp />);

    // Assert
    expect(screen.getByLabelText('Storybook component explorer')).toBeInTheDocument();
  });
});
