// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

const { default: ImageViewerApp } = await import('./ImageViewerApp');

describe('ImageViewerApp component', () => {
  it('should render a placeholder when no src is provided', () => {
    // Act
    render(<ImageViewerApp />, { wrapper });

    // Assert
    expect(screen.getByText('No image to display')).toBeInTheDocument();
  });

  it('should render an img element when src is provided', () => {
    // Arrange
    const src = 'Desktop/photo.jpg';

    // Act
    render(<ImageViewerApp src={src} />, { wrapper });

    // Assert
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should set the src attribute on the img', () => {
    // Arrange
    const src = 'Desktop/photo.png';

    // Act
    render(<ImageViewerApp src={src} />, { wrapper });

    // Assert
    expect(screen.getByRole('img')).toHaveAttribute('src', src);
  });

  it('should derive the alt text from the filename', () => {
    // Arrange
    const src = 'Desktop/my-photo.jpg';

    // Act
    render(<ImageViewerApp src={src} />, { wrapper });

    // Assert
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'my-photo.jpg');
  });
});
