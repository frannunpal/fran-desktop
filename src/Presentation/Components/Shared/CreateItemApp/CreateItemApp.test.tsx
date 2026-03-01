// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';

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

// Helper: render CreateItemApp with a mock WindowEntity
const renderCreateItemApp = (contentData: Record<string, unknown>) => {
  const win = createMockWindowEntity({ contentData });
  render(<CreateItemApp window={win} />, { wrapper });
  return { win };
};

describe('CreateItemApp', () => {
  it('should Render the app with folder title', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
    });
    expect(screen.getByText(/Create new folder/)).toBeInTheDocument();
  });

  it('should Render the app with file title', () => {
    renderCreateItemApp({ mode: 'file', parentId: 'folder-desktop', currentPath: '/home/Desktop' });
    expect(screen.getByText(/Create new file/)).toBeInTheDocument();
  });

  it('should Have an input for name', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
    });
    expect(screen.getByLabelText('Item name')).toBeInTheDocument();
  });

  it('should Have Cancel and OK buttons', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
    });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should Show icon picker for folders', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
    });
    expect(screen.getByText('Choose custom icon or color')).toBeInTheDocument();
  });

  it('should Not show icon picker for files', () => {
    renderCreateItemApp({ mode: 'file', parentId: 'folder-desktop', currentPath: '/home/Desktop' });
    expect(screen.queryByText('Choose custom icon or color')).not.toBeInTheDocument();
  });

  it('should Show current path in header', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Documents/Work',
    });
    expect(screen.getByText(/\/home\/Documents\/Work/)).toBeInTheDocument();
  });

  it('should show duplicate name error and disable OK when folder name already exists', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
    });

    // Arrange: type the name of the existing folder
    const input = screen.getByLabelText('Item name');
    fireEvent.change(input, { target: { value: 'Existing Folder' } });

    // Assert: error message shown and OK disabled
    expect(screen.getByText('There is already a folder with that name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).toBeDisabled();
  });

  it('should not show duplicate error when name is unique', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
    });

    const input = screen.getByLabelText('Item name');
    fireEvent.change(input, { target: { value: 'Brand New Folder' } });

    expect(screen.queryByText(/There is already a folder/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).not.toBeDisabled();
  });

  it('should disable OK when name is empty', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
    });

    const input = screen.getByLabelText('Item name');
    fireEvent.change(input, { target: { value: '' } });

    expect(screen.getByRole('button', { name: /ok/i })).toBeDisabled();
  });

  it('should open icon picker on mount when iconPickerOpen is true in contentData', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
      iconPickerOpen: true,
    });

    expect(screen.getByRole('button', { name: /choose custom icon/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('should keep icon picker closed when iconPickerOpen is false in contentData', () => {
    renderCreateItemApp({
      mode: 'folder',
      parentId: 'folder-desktop',
      currentPath: '/home/Desktop',
      iconPickerOpen: false,
    });

    expect(screen.getByRole('button', { name: /choose custom icon/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
