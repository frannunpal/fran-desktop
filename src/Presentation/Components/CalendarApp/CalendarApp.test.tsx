// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

vi.mock('@mantine/dates', () => ({
  Calendar: () => <div data-testid="calendar" />,
}));

const { default: CalendarApp } = await import('./CalendarApp');

describe('CalendarApp', () => {
  it('should render the calendar', () => {
    // Act
    render(<CalendarApp />, { wrapper });

    // Assert
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });
});
