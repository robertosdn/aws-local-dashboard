// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  useScheduleGroups: vi.fn(),
  useScheduleGroupDetails: vi.fn(),
  useSchedules: vi.fn(),
  useScheduleDetails: vi.fn(),
}));

vi.mock('@/features/eventbridge/scheduler/hooks', () => ({
  useScheduleGroups: hooks.useScheduleGroups,
  useScheduleGroupDetails: hooks.useScheduleGroupDetails,
  useSchedules: hooks.useSchedules,
  useScheduleDetails: hooks.useScheduleDetails,
}));

import SchedulerGroupsPage from '@/pages/SchedulerGroupsPage';
import SchedulerSchedulesPage from '@/pages/SchedulerSchedulesPage';

const emptyListResult = {
  scheduleGroups: [],
  schedules: [],
  nextToken: undefined,
  loading: false,
  fetching: false,
  error: null,
  refetch: vi.fn(),
};

describe('Scheduler page titles', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('uses Schedule Groups as the title with an EventBridge Scheduler label', () => {
    hooks.useScheduleGroups.mockReturnValue(emptyListResult);

    render(
      <MemoryRouter>
        <SchedulerGroupsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Schedule Groups' })).toBeTruthy();
    expect(screen.getByText('EventBridge Scheduler')).toBeTruthy();
  });

  it('keeps the Schedule Groups title in the error state', () => {
    hooks.useScheduleGroups.mockReturnValue({
      ...emptyListResult,
      error: new Error('Scheduler unavailable'),
    });

    render(
      <MemoryRouter>
        <SchedulerGroupsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Schedule Groups' })).toBeTruthy();
    expect(screen.getByText('Failed to load schedule groups.')).toBeTruthy();
  });

  it('opens the group detail from the View action', async () => {
    hooks.useScheduleGroups.mockReturnValue({
      ...emptyListResult,
      scheduleGroups: [{ name: 'orders', arn: 'arn:orders' }],
    });

    render(
      <MemoryRouter initialEntries={['/eventbridge/scheduler/groups']}>
        <Routes>
          <Route path="/eventbridge/scheduler/groups" element={<SchedulerGroupsPage />} />
          <Route
            path="/eventbridge/scheduler/groups/:groupName"
            element={<div>group-detail-route</div>}
          />
          <Route
            path="/eventbridge/scheduler/groups/:groupName/schedules"
            element={<div>schedules-route</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View details for orders' }));

    expect(await screen.findByText('group-detail-route')).toBeTruthy();
  });

  it('opens the group schedules from the Schedules action, not the group detail', async () => {
    hooks.useScheduleGroups.mockReturnValue({
      ...emptyListResult,
      scheduleGroups: [{ name: 'orders', arn: 'arn:orders' }],
    });

    render(
      <MemoryRouter initialEntries={['/eventbridge/scheduler/groups']}>
        <Routes>
          <Route path="/eventbridge/scheduler/groups" element={<SchedulerGroupsPage />} />
          <Route
            path="/eventbridge/scheduler/groups/:groupName"
            element={<div>group-detail-route</div>}
          />
          <Route
            path="/eventbridge/scheduler/groups/:groupName/schedules"
            element={<div>schedules-route</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View schedules in orders' }));

    expect(await screen.findByText('schedules-route')).toBeTruthy();
  });

  it('shows the group name on the schedules page', () => {
    hooks.useSchedules.mockReturnValue({ ...emptyListResult, schedules: [], nextToken: undefined });

    render(
      <MemoryRouter initialEntries={['/eventbridge/scheduler/groups/orders/schedules']}>
        <Routes>
          <Route
            path="/eventbridge/scheduler/groups/:groupName/schedules"
            element={<SchedulerSchedulesPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Schedules' })).toBeTruthy();
    expect(screen.getByText('orders')).toBeTruthy();
  });
});
