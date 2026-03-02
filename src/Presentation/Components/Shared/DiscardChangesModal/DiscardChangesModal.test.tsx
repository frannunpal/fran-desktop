// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { DiscardChangesModal } from './DiscardChangesModal';

const onConfirm = vi.fn();
const onCancel = vi.fn();

describe('DiscardChangesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when opened is true', () => {
    render(<DiscardChangesModal opened onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

    expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
    expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument();
  });

  it('does not render when opened is false', () => {
    render(<DiscardChangesModal opened={false} onConfirm={onConfirm} onCancel={onCancel} />, {
      wrapper,
    });

    expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(<DiscardChangesModal opened onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

    fireEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Discard Changes button is clicked', () => {
    render(<DiscardChangesModal opened onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

    fireEvent.click(screen.getByText('Discard Changes'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when modal is closed via escape key', () => {
    render(<DiscardChangesModal opened onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
