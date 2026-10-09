// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  useEventBuses: vi.fn(),
  useDeleteEventBus: vi.fn(),
}));

vi.mock('@/features/eventbridge/hooks', () => ({
  useEventBuses: hooks.useEventBuses,
  useDeleteEventBus: hooks.useDeleteEventBus,
}));

import EventBusesPage from '@/pages/EventBusesPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <EventBusesPage />
    </MemoryRouter>,
  );
}

describe('EventBridge page titles', () => {
  afterEach(cleanup);

  it('uses Event Buses as the title with an EventBridge label', () => {
    hooks.useEventBuses.mockReturnValue({
      eventBuses: [],
      nextToken: undefined,
      loading: false,
      fetching: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useDeleteEventBus.mockReturnValue({ deleteEventBus: vi.fn(), pending: false });

    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'Event Buses' })).toBeTruthy();
    expect(screen.getByText('EventBridge')).toBeTruthy();
  });

  it('keeps the Event Buses title in the error state', () => {
    hooks.useEventBuses.mockReturnValue({
      eventBuses: [],
      nextToken: undefined,
      loading: false,
      fetching: false,
      error: new Error('EventBridge unavailable'),
      refetch: vi.fn(),
    });
    hooks.useDeleteEventBus.mockReturnValue({ deleteEventBus: vi.fn(), pending: false });

    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'Event Buses' })).toBeTruthy();
    expect(screen.getByText('Failed to load event buses.')).toBeTruthy();
  });
});
