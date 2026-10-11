// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteSchedule,
  getScheduleDetails,
  getScheduleGroupDetails,
  listScheduleGroups,
  listSchedules,
  saveSchedule,
  setScheduleState,
} from '@/features/eventbridge/scheduler/api/scheduler';
import { useScheduleGroups } from '@/features/eventbridge/scheduler/hooks/useScheduleGroups';
import { useScheduleGroupDetails } from '@/features/eventbridge/scheduler/hooks/useScheduleGroupDetails';
import { useSchedules } from '@/features/eventbridge/scheduler/hooks/useSchedules';
import { useScheduleDetails } from '@/features/eventbridge/scheduler/hooks/useScheduleDetails';
import { useSaveSchedule } from '@/features/eventbridge/scheduler/hooks/useSaveSchedule';
import { useDeleteSchedule } from '@/features/eventbridge/scheduler/hooks/useDeleteSchedule';
import { useSetScheduleState } from '@/features/eventbridge/scheduler/hooks/useSetScheduleState';
import type { ScheduleFormValues } from '@/features/eventbridge/scheduler/types/scheduler';

const settingsMock = vi.hoisted(() => ({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
}));

vi.mock('@/features/settings/hooks/useSettings', () => ({
  useSettings: () => ({
    endpoint: settingsMock.endpoint,
    settings: {
      host: 'localhost',
      port: 4566,
      region: settingsMock.region,
      useHttps: false,
    },
  }),
}));

vi.mock('@/features/eventbridge/scheduler/api/scheduler', () => ({
  getScheduleDetails: vi.fn(),
  getScheduleGroupDetails: vi.fn(),
  listScheduleGroups: vi.fn(),
  listSchedules: vi.fn(),
  saveSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
  setScheduleState: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe('Scheduler hooks', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    settingsMock.endpoint = 'http://localhost:4566';
    settingsMock.region = 'us-east-1';
    vi.mocked(listScheduleGroups).mockResolvedValue({ scheduleGroups: [], nextToken: undefined });
    vi.mocked(getScheduleGroupDetails).mockResolvedValue({ name: 'orders', arn: 'arn:orders' });
    vi.mocked(listSchedules).mockResolvedValue({ schedules: [], nextToken: undefined });
    vi.mocked(getScheduleDetails).mockResolvedValue({
      name: 'hourly',
      arn: 'arn:hourly',
      groupName: 'orders',
      state: 'ENABLED',
    });
    vi.mocked(saveSchedule).mockResolvedValue({ name: 'hourly', arn: 'arn:hourly' });
    vi.mocked(deleteSchedule).mockResolvedValue();
    vi.mocked(setScheduleState).mockResolvedValue();
  });

  it('loads schedule groups with the active endpoint and region and forwards the cursor', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useScheduleGroups('page-2'), { wrapper });

    await waitFor(() => expect(listScheduleGroups).toHaveBeenCalledOnce());
    expect(listScheduleGroups).toHaveBeenCalledWith('page-2', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
    expect(result.current.error).toBeNull();
  });

  it('exposes list errors and refetches', async () => {
    vi.mocked(listScheduleGroups).mockRejectedValueOnce(new Error('List failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useScheduleGroups(), { wrapper });

    await waitFor(() => expect(result.current.error).toMatchObject({ message: 'List failed' }));

    vi.mocked(listScheduleGroups).mockResolvedValueOnce({
      scheduleGroups: [],
      nextToken: undefined,
    });
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(listScheduleGroups).toHaveBeenCalledTimes(2));
  });

  it('loads schedule group details only when a name is provided', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useScheduleGroupDetails(null), { wrapper });
    expect(getScheduleGroupDetails).not.toHaveBeenCalled();

    const { result } = renderHook(() => useScheduleGroupDetails('orders'), { wrapper });
    await waitFor(() =>
      expect(result.current.scheduleGroupDetails).toMatchObject({ name: 'orders' }),
    );
    expect(getScheduleGroupDetails).toHaveBeenCalledWith('orders', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
  });

  it('loads schedules with the group, state filter, and cursor', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useSchedules(null, undefined, undefined), { wrapper });
    expect(listSchedules).not.toHaveBeenCalled();

    renderHook(() => useSchedules('orders', 'ENABLED', 'page-2'), { wrapper });
    await waitFor(() => expect(listSchedules).toHaveBeenCalledOnce());
    expect(listSchedules).toHaveBeenCalledWith('orders', 'ENABLED', 'page-2', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
  });

  it('loads schedule details only when both group and schedule are provided', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useScheduleDetails('orders', null), { wrapper });
    expect(getScheduleDetails).not.toHaveBeenCalled();

    const { result } = renderHook(() => useScheduleDetails('orders', 'hourly'), { wrapper });
    await waitFor(() => expect(result.current.scheduleDetails).toMatchObject({ name: 'hourly' }));
    expect(getScheduleDetails).toHaveBeenCalledWith('orders', 'hourly', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
  });

  it('refetches when the active endpoint or region changes', async () => {
    const { wrapper } = createWrapper();
    const { rerender } = renderHook(() => useScheduleGroups(), { wrapper });
    await waitFor(() => expect(listScheduleGroups).toHaveBeenCalledOnce());

    settingsMock.endpoint = 'http://localhost:4572';
    settingsMock.region = 'eu-west-1';
    rerender();

    await waitFor(() => expect(listScheduleGroups).toHaveBeenCalledTimes(2));
    expect(listScheduleGroups).toHaveBeenLastCalledWith(undefined, {
      endpoint: 'http://localhost:4572',
      region: 'eu-west-1',
    });
  });

  it('saves a schedule and invalidates the schedule list and detail queries', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSaveSchedule('orders'), { wrapper });

    const values: ScheduleFormValues = {
      name: 'hourly',
      scheduleExpression: 'rate(1 hour)',
      scheduleExpressionTimezone: 'UTC',
      state: 'ENABLED',
      actionAfterCompletion: 'NONE',
      flexibleTimeWindow: { mode: 'OFF' },
      target: { arn: 'arn:aws:sqs:us-east-1:000000000000:orders' },
    };

    await act(async () => {
      await result.current.saveSchedule({
        groupName: 'orders',
        originalName: 'hourly',
        values,
      });
    });

    expect(saveSchedule).toHaveBeenCalledWith(
      { groupName: 'orders', originalName: 'hourly', values },
      { endpoint: 'http://localhost:4566', region: 'us-east-1' },
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['scheduler', 'schedules', 'http://localhost:4566', 'us-east-1', 'orders'],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['scheduler', 'schedule', 'http://localhost:4566', 'us-east-1', 'orders', 'hourly'],
    });
  });

  it('deletes a schedule and invalidates its queries', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteSchedule('orders'), { wrapper });

    await act(async () => {
      await result.current.deleteSchedule({ groupName: 'orders', scheduleName: 'hourly' });
    });

    expect(deleteSchedule).toHaveBeenCalledWith(
      { groupName: 'orders', scheduleName: 'hourly' },
      { endpoint: 'http://localhost:4566', region: 'us-east-1' },
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['scheduler', 'schedules', 'http://localhost:4566', 'us-east-1', 'orders'],
    });
  });

  it('changes a schedule state and surfaces errors', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSetScheduleState('orders'), { wrapper });

    await act(async () => {
      await result.current.setScheduleState({
        groupName: 'orders',
        scheduleName: 'hourly',
        state: 'DISABLED',
      });
    });

    expect(setScheduleState).toHaveBeenCalledWith(
      { groupName: 'orders', scheduleName: 'hourly', state: 'DISABLED' },
      { endpoint: 'http://localhost:4566', region: 'us-east-1' },
    );

    vi.mocked(setScheduleState).mockRejectedValueOnce(new Error('State failed'));
    await act(async () => {
      await expect(
        result.current.setScheduleState({
          groupName: 'orders',
          scheduleName: 'hourly',
          state: 'ENABLED',
        }),
      ).rejects.toThrow('State failed');
    });
  });
});
