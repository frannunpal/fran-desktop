// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import IconColorPicker from './IconColorPicker';
import { PRESET_ICONS } from '@/Shared/Constants/Icons';
import { PRESET_COLORS } from '@/Shared/Constants/Colors';

vi.mock('react-icons/vsc', () => {
  const icons: Record<string, () => React.ReactElement> = {};
  [
    'VscFolder',
    'VscFolderOpened',
    'VscHome',
    'VscServer',
    'VscDatabase',
    'VscBook',
    'VscMail',
    'VscGithub',
    'VscCloud',
    'VscLock',
    'VscSettingsGear',
    'VscStar',
    'VscHeart',
    'VscMusic',
    'VscCamera',
    'VscArchive',
  ].forEach(name => {
    icons[name] = () => <svg data-testid={`icon-${name}`} />;
  });
  return icons;
});

const defaultProps = {
  selectedIcon: 'VscFolder',
  selectedColor: '#868e96',
  onIconChange: vi.fn(),
  onColorChange: vi.fn(),
};

describe('IconColorPicker', () => {
  it('should render all preset icons', () => {
    // Act
    render(<IconColorPicker {...defaultProps} />, { wrapper });

    // Assert
    PRESET_ICONS.forEach(name => {
      expect(screen.getByTestId(`icon-${name}`)).toBeInTheDocument();
    });
  });

  it('should render all preset color swatches', () => {
    // Act
    render(<IconColorPicker {...defaultProps} />, { wrapper });

    // Assert
    PRESET_COLORS.forEach(color => {
      expect(screen.getByLabelText(`Color ${color}`)).toBeInTheDocument();
    });
  });

  it('should call onIconChange when an icon is clicked', () => {
    // Arrange
    const onIconChange = vi.fn();
    render(<IconColorPicker {...defaultProps} onIconChange={onIconChange} />, { wrapper });

    // Act
    fireEvent.click(screen.getByLabelText('VscHome'));

    // Assert
    expect(onIconChange).toHaveBeenCalledWith('VscHome');
  });

  it('should call onColorChange when a color swatch is clicked', () => {
    // Arrange
    const onColorChange = vi.fn();
    render(<IconColorPicker {...defaultProps} onColorChange={onColorChange} />, { wrapper });

    // Act
    fireEvent.click(screen.getByLabelText('Color #fa5252'));

    // Assert
    expect(onColorChange).toHaveBeenCalledWith('#fa5252');
  });

  it('should mark selected icon with aria-pressed', () => {
    // Act
    render(<IconColorPicker {...defaultProps} selectedIcon="VscFolder" />, { wrapper });

    // Assert
    expect(screen.getByLabelText('VscFolder')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('VscHome')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render the custom color input', () => {
    // Act
    render(<IconColorPicker {...defaultProps} />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Custom color picker')).toBeInTheDocument();
  });
});
