// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';

vi.mock('@presentation/Hooks/useFcIcon', () => ({
  useFcIconElement: (name: string) => (name ? <svg data-testid="fc-icon" /> : null),
}));

const { default: AppMenuBar } = await import('./AppMenuBar');

describe('AppMenuBar', () => {
  describe('given an empty elements array', () => {
    it('should render the menubar container', () => {
      // Arrange
      const elements: AppMenuElement[] = [];

      // Act
      render(<AppMenuBar elements={elements} />, { wrapper });

      // Assert
      expect(screen.getByRole('menubar')).toBeInTheDocument();
    });
  });

  describe('given a menu dropdown element', () => {
    const menuEl: AppMenuElement = {
      type: 'menu',
      label: 'File',
      items: [
        { type: 'item', label: 'New file', onClick: vi.fn() },
        { type: 'divider' },
        { type: 'item', label: 'Save', onClick: vi.fn(), disabled: true },
      ],
    };

    it('should render the trigger button with the label', () => {
      // Act
      render(<AppMenuBar elements={[menuEl]} />, { wrapper });

      // Assert
      expect(screen.getByText('File')).toBeInTheDocument();
    });

    it('should not show dropdown items before trigger is clicked', () => {
      // Act
      render(<AppMenuBar elements={[menuEl]} />, { wrapper });

      // Assert — keepMounted keeps items in DOM but hidden
      expect(screen.getByText('New file')).not.toBeVisible();
    });

    it('should show dropdown items after trigger is clicked', () => {
      // Act
      render(<AppMenuBar elements={[menuEl]} />, { wrapper });
      fireEvent.click(screen.getByText('File'));

      // Assert
      expect(screen.getByText('New file')).toBeInTheDocument();
    });

    it('should call onClick when an enabled item is clicked', () => {
      // Arrange
      const handleClick = vi.fn();
      const el: AppMenuElement = {
        type: 'menu',
        label: 'File',
        items: [{ type: 'item', label: 'New file', onClick: handleClick }],
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });
      fireEvent.click(screen.getByText('File'));
      fireEvent.click(screen.getByText('New file'));

      // Assert
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should not call onClick when a disabled item is clicked', () => {
      // Arrange
      const handleClick = vi.fn();
      const el: AppMenuElement = {
        type: 'menu',
        label: 'Edit',
        items: [{ type: 'item', label: 'Undo', onClick: handleClick, disabled: true }],
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Undo'));

      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should render the trigger icon when icon prop is provided', () => {
      // Arrange
      const el: AppMenuElement = { type: 'menu', label: 'File', icon: 'FcFile', items: [] };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });

      // Assert
      expect(screen.getByTestId('fc-icon')).toBeInTheDocument();
    });
  });

  describe('given a switch element', () => {
    it('should render the label', () => {
      // Arrange
      const el: AppMenuElement = {
        type: 'switch',
        label: 'Word wrap',
        checked: false,
        onChange: vi.fn(),
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });

      // Assert
      expect(screen.getByText('Word wrap')).toBeInTheDocument();
    });

    it('should call onChange with true when toggled on', () => {
      // Arrange
      const handleChange = vi.fn();
      const el: AppMenuElement = {
        type: 'switch',
        label: 'Word wrap',
        checked: false,
        onChange: handleChange,
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });
      fireEvent.click(screen.getByRole('switch'));

      // Assert
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange with false when toggled off', () => {
      // Arrange
      const handleChange = vi.fn();
      const el: AppMenuElement = {
        type: 'switch',
        label: 'Word wrap',
        checked: true,
        onChange: handleChange,
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });
      fireEvent.click(screen.getByRole('switch'));

      // Assert
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('given a slider element', () => {
    it('should render the label when provided', () => {
      // Arrange
      const el: AppMenuElement = {
        type: 'slider',
        label: 'Zoom',
        min: 50,
        max: 200,
        value: 100,
        onChange: vi.fn(),
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });

      // Assert
      expect(screen.getByText('Zoom')).toBeInTheDocument();
    });

    it('should render without label when label is absent', () => {
      // Arrange
      const el: AppMenuElement = {
        type: 'slider',
        min: 0,
        max: 100,
        value: 50,
        onChange: vi.fn(),
      };

      // Act
      const { container } = render(<AppMenuBar elements={[el]} />, { wrapper });

      // Assert — no span.sliderLabel rendered
      expect(container.querySelector('.sliderLabel')).toBeNull();
    });

    it('should render the slider input', () => {
      // Arrange
      const el: AppMenuElement = {
        type: 'slider',
        label: 'Zoom',
        min: 50,
        max: 200,
        value: 100,
        onChange: vi.fn(),
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });

      // Assert
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  describe('given a text-input element', () => {
    it('should render with the correct placeholder', () => {
      // Arrange
      const el: AppMenuElement = {
        type: 'text-input',
        placeholder: 'Search...',
        value: '',
        onChange: vi.fn(),
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });

      // Assert
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should call onChange with the new value on input', () => {
      // Arrange
      const handleChange = vi.fn();
      const el: AppMenuElement = {
        type: 'text-input',
        placeholder: 'Search...',
        value: '',
        onChange: handleChange,
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });
      fireEvent.change(screen.getByPlaceholderText('Search...'), {
        target: { value: 'hello' },
      });

      // Assert
      expect(handleChange).toHaveBeenCalledWith('hello');
    });
  });

  describe('given a combobox element', () => {
    it('should render with the correct initial value', () => {
      // Arrange
      const el: AppMenuElement = {
        type: 'combobox',
        options: ['List', 'Grid', 'Details'],
        value: 'Grid',
        onChange: vi.fn(),
      };

      // Act
      render(<AppMenuBar elements={[el]} />, { wrapper });

      // Assert — Mantine Select renders both a visible input and a hidden input with the value
      expect(screen.getAllByDisplayValue('Grid').length).toBeGreaterThan(0);
    });
  });

  describe('given multiple elements of different types', () => {
    it('should render all elements', () => {
      // Arrange
      const elements: AppMenuElement[] = [
        { type: 'menu', label: 'File', items: [] },
        { type: 'switch', label: 'Wrap', checked: false, onChange: vi.fn() },
        { type: 'text-input', placeholder: 'Search', value: '', onChange: vi.fn() },
      ];

      // Act
      render(<AppMenuBar elements={elements} />, { wrapper });

      // Assert
      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Wrap')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });
  });
});
