// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import ColorPicker from './ColorPicker';
import { PRESET_COLORS } from '@/Shared/Constants/Colors';

describe('ColorPicker', () => {
  it('renders all preset color swatches', () => {
    // Act
    render(<ColorPicker value="#868e96" onChange={() => {}} />, { wrapper });

    // Assert
    PRESET_COLORS.forEach(color => {
      expect(screen.getByRole('button', { name: `Color ${color}` })).toBeInTheDocument();
    });
  });

  it('marks the matching preset swatch as selected', () => {
    // Arrange
    const selectedColor = PRESET_COLORS[0];

    // Act
    render(<ColorPicker value={selectedColor} onChange={() => {}} />, { wrapper });

    // Assert
    expect(screen.getByRole('button', { name: `Color ${selectedColor}` })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('calls onChange when a preset swatch is clicked', () => {
    // Arrange
    const onChange = vi.fn();
    const targetColor = PRESET_COLORS[2];
    render(<ColorPicker value="#000000" onChange={onChange} />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: `Color ${targetColor}` }));

    // Assert
    expect(onChange).toHaveBeenCalledWith(targetColor);
  });

  it('renders the custom color input', () => {
    // Act
    render(<ColorPicker value="#123456" onChange={() => {}} />, { wrapper });

    // Assert
    expect(screen.getByRole('textbox', { name: 'Custom color picker' })).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    // Act
    render(<ColorPicker value="#000" onChange={() => {}} error="Invalid color" />, { wrapper });

    // Assert
    expect(screen.getByText('Invalid color')).toBeInTheDocument();
  });
});
