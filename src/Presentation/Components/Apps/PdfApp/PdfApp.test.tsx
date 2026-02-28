// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

const { default: PdfApp } = await import('./PdfApp');

describe('PdfApp component', () => {
  it('should render an iframe', () => {
    // Act
    render(<PdfApp />, { wrapper });

    // Assert
    expect(screen.getByTitle('CV')).toBeInTheDocument();
  });

  it('should have the default PDF src when no prop provided', () => {
    // Act
    render(<PdfApp />, { wrapper });

    // Assert
    expect(screen.getByTitle('CV')).toHaveAttribute('src', 'Desktop/CV_2026_English.pdf');
  });

  it('should use the provided src prop', () => {
    // Act
    render(<PdfApp src="Documents/report.pdf" />, { wrapper });

    // Assert
    expect(screen.getByTitle('CV')).toHaveAttribute('src', 'Documents/report.pdf');
  });

  it('should have an accessible label', () => {
    // Act
    render(<PdfApp />, { wrapper });

    // Assert
    expect(screen.getByLabelText('PDF viewer')).toBeInTheDocument();
  });
});
