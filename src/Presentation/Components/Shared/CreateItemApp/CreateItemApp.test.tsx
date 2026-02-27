// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

vi.mock('../IconColorPicker/IconColorPicker', () => ({
  default: () => <div>IconPicker</div>,
  PRESET_ICONS: ['VscFolder'],
  PRESET_COLORS: ['#868e96'],
}));

vi.mock('react-icons/vsc', () => ({
  VscFolder: () => <svg data-testid="VscFolder" />,
  VscChevronDown: () => <svg />,
  VscClose: () => <svg />,
  VscCheck: () => <svg />,
}));

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: () => ({
    closeWindow: () => {},
    createFile: () => {},
    createFolder: () => {},
  }),
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
});
