// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteEventBus,
  getEventBusDetails,
  listEventBuses,
  listRules,
  listTargetsByRule,
} from '@/features/eventbridge/api/eventbridge';
import { useEventBuses } from '@/features/eventbridge/hooks/useEventBuses';
import { useEventBusDetails } from '@/features/eventbridge/hooks/useEventBusDetails';
import { useEventBusRules } from '@/features/eventbridge/hooks/useEventBusRules';
import { useRuleTargets } from '@/features/eventbridge/hooks/useRuleTargets';
import { useDeleteEventBus } from '@/features/eventbridge/hooks/useDeleteEventBus';

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

vi.mock('@/features/eventbridge/api/eventbridge', () => ({
  deleteEventBus: vi.fn(),
  getEventBusDetails: vi.fn(),
  listEventBuses: vi.fn(),
  listRules: vi.fn(),
  listTargetsByRule: vi.fn(),
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

describe('EventBridge hooks', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    settingsMock.endpoint = 'http://localhost:4566';
    settingsMock.region = 'us-east-1';
    vi.mocked(listEventBuses).mockResolvedValue({ eventBuses: [], nextToken: undefined });
    vi.mocked(getEventBusDetails).mockResolvedValue({
      name: 'orders',
      arn: 'arn:orders',
      rules: [],
    });
    vi.mocked(listRules).mockResolvedValue({ rules: [], nextToken: undefined });
    vi.mocked(listTargetsByRule).mockResolvedValue([]);
    vi.mocked(deleteEventBus).mockResolvedValue();
  });

  it('loads event buses with the active endpoint and region and forwards the cursor', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useEventBuses('page-2'), { wrapper });

    await waitFor(() => expect(listEventBuses).toHaveBeenCalledOnce());
    expect(listEventBuses).toHaveBeenCalledWith('page-2', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
    expect(result.current.error).toBeNull();
  });

  it('exposes list errors and refetches across pagination keys', async () => {
    vi.mocked(listEventBuses).mockRejectedValueOnce(new Error('List failed'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useEventBuses(), { wrapper });

    await waitFor(() => expect(result.current.error).toMatchObject({ message: 'List failed' }));

    vi.mocked(listEventBuses).mockResolvedValueOnce({ eventBuses: [], nextToken: undefined });
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(listEventBuses).toHaveBeenCalledTimes(2));
  });

  it('loads event bus details only when a name is provided', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useEventBusDetails(null), { wrapper });
    expect(getEventBusDetails).not.toHaveBeenCalled();

    const { result } = renderHook(() => useEventBusDetails('orders'), { wrapper });
    await waitFor(() =>
      expect(result.current.eventBusDetails).toMatchObject({ name: 'orders' }),
    );
    expect(getEventBusDetails).toHaveBeenCalledWith('orders', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
  });

  it('loads rules only when an event bus is selected and forwards the rule cursor', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useEventBusRules(null), { wrapper });
    expect(listRules).not.toHaveBeenCalled();

    renderHook(() => useEventBusRules('orders', 'rules-page-2'), { wrapper });
    await waitFor(() => expect(listRules).toHaveBeenCalledOnce());
    expect(listRules).toHaveBeenCalledWith('orders', 'rules-page-2', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
  });

  it('loads rule targets only when both bus and rule are provided', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useRuleTargets('orders', null), { wrapper });
    expect(listTargetsByRule).not.toHaveBeenCalled();

    const { result } = renderHook(() => useRuleTargets('orders', 'orders-rule'), { wrapper });
    await waitFor(() => expect(listTargetsByRule).toHaveBeenCalledOnce());
    expect(listTargetsByRule).toHaveBeenCalledWith('orders-rule', 'orders', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
    expect(result.current.error).toBeNull();
  });

  it('invalidates the event bus list after a successful deletion', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteEventBus(), { wrapper });

    await act(async () => {
      await result.current.deleteEventBus({ name: 'orders' });
    });

    expect(deleteEventBus).toHaveBeenCalledWith('orders', {
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['eventbridge', 'eventbuses'] });
  });

  it('refetches when the active endpoint or region changes', async () => {
    const { wrapper } = createWrapper();
    const { rerender } = renderHook(() => useEventBuses(), { wrapper });
    await waitFor(() => expect(listEventBuses).toHaveBeenCalledOnce());

    settingsMock.endpoint = 'http://localhost:4572';
    settingsMock.region = 'eu-west-1';
    rerender();

    await waitFor(() => expect(listEventBuses).toHaveBeenCalledTimes(2));
    expect(listEventBuses).toHaveBeenLastCalledWith(undefined, {
      endpoint: 'http://localhost:4572',
      region: 'eu-west-1',
    });
  });
});
