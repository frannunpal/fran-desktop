// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

vi.mock('../IconColorPicker/IconColorPicker', () => ({
  default: ({
    onIconChange,
    onColorChange,
  }: {
    onIconChange: (v: string) => void;
    onColorChange: (v: string) => void;
  }) => (
    <div>
      <button onClick={() => onIconChange('VscHome')}>Pick Icon</button>
      <button onClick={() => onColorChange('#ff0000')}>Pick Color</button>
    </div>
  ),
  PRESET_ICONS: ['VscFolder'],
  PRESET_COLORS: ['#868e96'],
}));

vi.mock('react-icons/vsc', () => ({
  VscFolder: () => <svg data-testid="VscFolder" />,
  VscChevronDown: () => <svg />,
  VscClose: () => <svg />,
  VscCheck: () => <svg />,
  VscHome: () => <svg data-testid="VscHome" />,
}));

const { default: CreateItemModal } = await import('./CreateItemModal');

const defaultProps = {
  opened: true,
  mode: 'folder' as const,
  currentPath: '/home/Desktop',
  onClose: vi.fn(),
  onConfirm: vi.fn(),
};

describe('CreateItemModal', () => {
  it('should render the modal with folder title', () => {
    // Act
    render(<CreateItemModal {...defaultProps} />, { wrapper });

    // Assert
    expect(screen.getByText(/Create new folder/)).toBeInTheDocument();
    expect(screen.getByText(/\/home\/Desktop/)).toBeInTheDocument();
  });

  it('should render with file title when mode is file', () => {
    // Act
    render(<CreateItemModal {...defaultProps} mode="file" />, { wrapper });

    // Assert
    expect(screen.getByText(/Create new file/)).toBeInTheDocument();
  });

  it('should call onConfirm with the entered name on OK click', () => {
    // Arrange
    const onConfirm = vi.fn();
    render(<CreateItemModal {...defaultProps} onConfirm={onConfirm} />, { wrapper });
    const input = screen.getByLabelText('Item name');

    // Act
    fireEvent.change(input, { target: { value: 'My Folder' } });
    fireEvent.click(screen.getByText('OK'));

    // Assert
    expect(onConfirm).toHaveBeenCalledWith('My Folder', expect.any(String), expect.any(String));
  });

  it('should call onConfirm without icon/color when mode is file', () => {
    // Arrange
    const onConfirm = vi.fn();
    render(<CreateItemModal {...defaultProps} mode="file" onConfirm={onConfirm} />, { wrapper });
    const input = screen.getByLabelText('Item name');

    // Act
    fireEvent.change(input, { target: { value: 'notes.txt' } });
    fireEvent.click(screen.getByText('OK'));

    // Assert
    expect(onConfirm).toHaveBeenCalledWith('notes.txt', undefined, undefined);
  });

  it('should call onClose when Cancel is clicked', () => {
    // Arrange
    const onClose = vi.fn();
    render(<CreateItemModal {...defaultProps} onClose={onClose} />, { wrapper });

    // Act
    fireEvent.click(screen.getByText('Cancel'));

    // Assert
    expect(onClose).toHaveBeenCalled();
  });

  it('should not call onConfirm when name is empty', () => {
    // Arrange
    const onConfirm = vi.fn();
    render(<CreateItemModal {...defaultProps} onConfirm={onConfirm} />, { wrapper });
    const input = screen.getByLabelText('Item name');

    // Act
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByText('OK'));

    // Assert
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should show icon picker section for folder mode', () => {
    // Act
    render(<CreateItemModal {...defaultProps} mode="folder" />, { wrapper });

    // Assert
    expect(screen.getByText('Choose custom icon or color')).toBeInTheDocument();
  });

  it('should not show icon picker section for file mode', () => {
    // Act
    render(<CreateItemModal {...defaultProps} mode="file" />, { wrapper });

    // Assert
    expect(screen.queryByText('Choose custom icon or color')).not.toBeInTheDocument();
  });
});
