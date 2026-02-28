// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';

vi.mock('../IconColorPicker/IconColorPicker', () => ({
  default: ({ colorError }: { colorError?: string }) => (
    <div>
      IconPicker
      {colorError && <span role="alert">{colorError}</span>}
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
}));

const existingFolder: FolderNode = {
  id: 'node-1',
  type: 'folder',
  name: 'Existing Folder',
  parentId: 'folder-desktop',
  children: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeStoreMock = (fsNodes = [existingFolder]) =>
  vi.fn((selector: (s: object) => unknown) =>
    selector({
      closeWindow: () => {},
      createFile: () => {},
      createFolder: () => {},
      resizeWindow: () => {},
      windows: [],
      fsNodes,
    }),
  );

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: makeStoreMock(),
}));

const { default: CreateItemApp } = await import('./CreateItemApp');

describe('CreateItemApp', () => {
  it('should Render the app with folder title', () => {
    render(<CreateItemApp mode="folder" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });
    expect(screen.getByText(/Create new folder/)).toBeInTheDocument();
  });

  it('should Render the app with file title', () => {
    render(<CreateItemApp mode="file" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });
    expect(screen.getByText(/Create new file/)).toBeInTheDocument();
  });

  it('should Have an input for name', () => {
    render(<CreateItemApp mode="folder" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });
    expect(screen.getByLabelText('Item name')).toBeInTheDocument();
  });

  it('should Have Cancel and OK buttons', () => {
    render(<CreateItemApp mode="folder" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should Show icon picker for folders', () => {
    render(<CreateItemApp mode="folder" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });
    expect(screen.getByText('Choose custom icon or color')).toBeInTheDocument();
  });

  it('should Not show icon picker for files', () => {
    render(<CreateItemApp mode="file" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });
    expect(screen.queryByText('Choose custom icon or color')).not.toBeInTheDocument();
  });

  it('should Show current path in header', () => {
    render(
      <CreateItemApp mode="folder" parentId="folder-desktop" currentPath="/home/Documents/Work" />,
      { wrapper },
    );
    expect(screen.getByText(/\/home\/Documents\/Work/)).toBeInTheDocument();
  });

  it('should show duplicate name error and disable OK when folder name already exists', () => {
    render(<CreateItemApp mode="folder" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });

    // Arrange: type the name of the existing folder
    const input = screen.getByLabelText('Item name');
    fireEvent.change(input, { target: { value: 'Existing Folder' } });

    // Assert: error message shown and OK disabled
    expect(screen.getByText('There is already a folder with that name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).toBeDisabled();
  });

  it('should not show duplicate error when name is unique', () => {
    render(<CreateItemApp mode="folder" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });

    const input = screen.getByLabelText('Item name');
    fireEvent.change(input, { target: { value: 'Brand New Folder' } });

    expect(screen.queryByText(/There is already a folder/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).not.toBeDisabled();
  });

  it('should disable OK when name is empty', () => {
    render(<CreateItemApp mode="folder" parentId="folder-desktop" currentPath="/home/Desktop" />, {
      wrapper,
    });

    const input = screen.getByLabelText('Item name');
    fireEvent.change(input, { target: { value: '' } });

    expect(screen.getByRole('button', { name: /ok/i })).toBeDisabled();
  });

  it('should open icon picker on mount when iconPickerOpen is true', () => {
    render(
      <CreateItemApp
        mode="folder"
        parentId="folder-desktop"
        currentPath="/home/Desktop"
        iconPickerOpen
      />,
      { wrapper },
    );

    expect(screen.getByRole('button', { name: /choose custom icon/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('should sync icon picker state when iconPickerOpen prop changes', () => {
    const { rerender } = render(
      <CreateItemApp
        mode="folder"
        parentId="folder-desktop"
        currentPath="/home/Desktop"
        iconPickerOpen={false}
      />,
      { wrapper },
    );

    expect(screen.getByRole('button', { name: /choose custom icon/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    rerender(
      <CreateItemApp
        mode="folder"
        parentId="folder-desktop"
        currentPath="/home/Desktop"
        iconPickerOpen={true}
      />,
    );

    expect(screen.getByRole('button', { name: /choose custom icon/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
