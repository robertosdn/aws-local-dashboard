// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScheduleExpressionDisplay } from '@/features/eventbridge/scheduler/components/ScheduleExpressionDisplay';
import { ScheduleGroupDetails } from '@/features/eventbridge/scheduler/components/ScheduleGroupDetails';
import { ScheduleGroupTable } from '@/features/eventbridge/scheduler/components/ScheduleGroupTable';
import { ScheduleTable } from '@/features/eventbridge/scheduler/components/ScheduleTable';
import { ScheduleTargetDisplay } from '@/features/eventbridge/scheduler/components/ScheduleTargetDisplay';
import { ScheduleExpressionField } from '@/features/eventbridge/scheduler/components/ScheduleExpressionField';
import { ScheduleTargetEditor } from '@/features/eventbridge/scheduler/components/ScheduleTargetEditor';
import { ScheduleFormDialog } from '@/features/eventbridge/scheduler/components/ScheduleFormDialog';
import { DeleteScheduleDialog } from '@/features/eventbridge/scheduler/components/DeleteScheduleDialog';

const detailsMock = vi.hoisted(() => ({ useScheduleDetails: vi.fn() }));

vi.mock('@/features/eventbridge/scheduler/hooks/useScheduleDetails', () => ({
  useScheduleDetails: detailsMock.useScheduleDetails,
}));

describe('Scheduler components', () => {
  beforeEach(() => {
    detailsMock.useScheduleDetails.mockReturnValue({
      scheduleDetails: undefined,
      loading: false,
      fetching: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders schedule groups with View and Schedules actions', () => {
    const onViewGroup = vi.fn();
    const onViewSchedules = vi.fn();

    render(
      <ScheduleGroupTable
        scheduleGroups={[{ name: 'orders', arn: 'arn:orders' }]}
        loading={false}
        onViewGroup={onViewGroup}
        onViewSchedules={onViewSchedules}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View details for orders' }));
    expect(onViewGroup).toHaveBeenCalledWith('orders');

    fireEvent.click(screen.getByRole('button', { name: 'View schedules in orders' }));
    expect(onViewSchedules).toHaveBeenCalledWith('orders');
  });

  it('shows an empty state when no schedule groups exist', () => {
    render(
      <ScheduleGroupTable
        scheduleGroups={[]}
        loading={false}
        onViewGroup={vi.fn()}
        onViewSchedules={vi.fn()}
      />,
    );

    expect(screen.getByText('No schedule groups found')).toBeTruthy();
  });

  it('renders schedules with state badges and opens a schedule', () => {
    const onViewSchedule = vi.fn();

    render(
      <ScheduleTable
        schedules={[
          {
            name: 'hourly',
            arn: 'arn:hourly',
            groupName: 'orders',
            state: 'ENABLED',
            targetArn: 'arn:target',
          },
          {
            name: 'nightly',
            arn: 'arn:nightly',
            groupName: 'orders',
            state: 'DISABLED',
          },
        ]}
        loading={false}
        hasNextPage={false}
        onViewSchedule={onViewSchedule}
        onLoadMore={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText('ENABLED')).toBeTruthy();
    expect(screen.getByText('DISABLED')).toBeTruthy();
    expect(screen.getByText('arn:target')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'View details for hourly' }));
    expect(onViewSchedule).toHaveBeenCalledWith('hourly');
  });

  it('offers management actions on each schedule row', () => {
    const onCreate = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetState = vi.fn();
    const schedule = {
      name: 'hourly',
      arn: 'arn:hourly',
      groupName: 'orders',
      state: 'ENABLED' as const,
    };

    render(
      <ScheduleTable
        schedules={[schedule]}
        loading={false}
        hasNextPage={false}
        onViewSchedule={vi.fn()}
        onLoadMore={vi.fn()}
        onRetry={vi.fn()}
        onCreateSchedule={onCreate}
        onEditSchedule={onEdit}
        onDeleteSchedule={onDelete}
        onSetScheduleState={onSetState}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create schedule' }));
    expect(onCreate).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Edit schedule hourly' }));
    expect(onEdit).toHaveBeenCalledWith(schedule);

    fireEvent.click(screen.getByRole('button', { name: 'Delete schedule hourly' }));
    expect(onDelete).toHaveBeenCalledWith(schedule);

    fireEvent.click(screen.getByRole('button', { name: 'Disable schedule hourly' }));
    expect(onSetState).toHaveBeenCalledWith(schedule, 'DISABLED');
  });

  it('shows the create action in the empty state', () => {
    const onCreate = vi.fn();

    render(
      <ScheduleTable
        schedules={[]}
        loading={false}
        hasNextPage={false}
        onViewSchedule={vi.fn()}
        onLoadMore={vi.fn()}
        onRetry={vi.fn()}
        onCreateSchedule={onCreate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create schedule' }));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('offers a load more action when more schedules exist', () => {
    const onLoadMore = vi.fn();

    render(
      <ScheduleTable
        schedules={[{ name: 'hourly', arn: 'arn:hourly', groupName: 'orders', state: 'ENABLED' }]}
        loading={false}
        hasNextPage
        onViewSchedule={vi.fn()}
        onLoadMore={onLoadMore}
        onRetry={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Load more schedules' }));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it('shows a retryable error state when schedules fail to load', () => {
    const onRetry = vi.fn();

    render(
      <ScheduleTable
        schedules={[]}
        loading={false}
        error={new Error('Boom')}
        hasNextPage={false}
        onViewSchedule={vi.fn()}
        onLoadMore={vi.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText('Failed to load schedules')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('describes common schedule expressions while keeping the raw value', () => {
    render(<ScheduleExpressionDisplay expression="rate(5 minutes)" timezone="UTC" />);

    expect(screen.getByText('rate(5 minutes)')).toBeTruthy();
    expect(screen.getByText('Every 5 minutes')).toBeTruthy();
    expect(screen.getByText('Timezone: UTC')).toBeTruthy();
  });

  it('describes a daily cron expression', () => {
    render(<ScheduleExpressionDisplay expression="cron(0 12 * * ? *)" />);

    expect(screen.getByText('Every day at 12:00')).toBeTruthy();
  });

  it('renders a placeholder when a schedule has no target', () => {
    render(<ScheduleTargetDisplay />);

    expect(
      screen.getByText('This schedule does not declare a target in its current configuration.'),
    ).toBeTruthy();
  });

  it('renders the group metadata and exposes a schedules action', () => {
    const onViewSchedules = vi.fn();

    render(
      <ScheduleGroupDetails
        scheduleGroupDetails={{
          name: 'orders',
          arn: 'arn:orders',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        }}
        loading={false}
        onBack={vi.fn()}
        onViewSchedules={onViewSchedules}
      />,
    );

    expect(screen.getByRole('heading', { level: 3, name: 'orders' })).toBeTruthy();
    expect(screen.getByText('arn:orders')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'View schedules' }));
    expect(onViewSchedules).toHaveBeenCalledOnce();
  });

  it('validates the schedule expression and time zone inline', () => {
    const onExpressionChange = vi.fn();
    const onTimezoneChange = vi.fn();

    render(
      <ScheduleExpressionField
        expression="rate(5 minutes)"
        timezone="UTC"
        onExpressionChange={onExpressionChange}
        onTimezoneChange={onTimezoneChange}
      />,
    );

    expect(screen.getByText('Every 5 minutes')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Schedule expression'), {
      target: { value: 'rate(0 minutes)' },
    });
    expect(onExpressionChange).toHaveBeenCalledWith('rate(0 minutes)');

    fireEvent.change(screen.getByLabelText('Time zone'), { target: { value: 'Not/AZone' } });
    expect(onTimezoneChange).toHaveBeenCalledWith('Not/AZone');
  });

  it('reports expression errors as the developer types', () => {
    render(
      <ScheduleExpressionField
        expression="rate("
        timezone="UTC"
        onExpressionChange={vi.fn()}
        onTimezoneChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Schedule expression').getAttribute('aria-invalid')).toBe('true');
  });

  it('shows target fields for the ARN service and reports validation errors', () => {
    const { rerender } = render(
      <ScheduleTargetEditor
        target={{
          arn: 'arn:aws:sqs:us-east-1:000000000000:orders',
          roleArn: 'arn:aws:iam::000000000000:role/scheduler-role',
        }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('SQS message group ID (optional)')).toBeTruthy();

    rerender(
      <ScheduleTargetEditor
        target={{
          arn: 'arn:aws:kinesis:us-east-1:000000000000:stream/data',
          roleArn: 'arn:aws:iam::000000000000:role/scheduler-role',
        }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Kinesis partition key')).toBeTruthy();
    expect(screen.getByText('Kinesis targets require a partition key')).toBeTruthy();

    rerender(<ScheduleTargetEditor target={{ arn: '' }} onChange={vi.fn()} />);
    expect(screen.getByText('Target ARN is required')).toBeTruthy();
    expect(screen.getByText('Target role ARN is required')).toBeTruthy();
  });

  it('blocks saving a schedule until the form is valid and then submits it', async () => {
    const onSave = vi.fn();

    render(
      <ScheduleFormDialog
        open
        groupName="orders"
        pending={false}
        onOpenChange={vi.fn()}
        onSave={onSave}
      />,
    );

    const saveButton = screen.getByRole('button', { name: 'Save schedule' }) as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('Schedule name'), { target: { value: 'hourly' } });
    fireEvent.change(screen.getByLabelText('Schedule expression'), {
      target: { value: 'rate(5 minutes)' },
    });
    fireEvent.change(screen.getByLabelText('Target ARN'), {
      target: { value: 'arn:aws:sqs:us-east-1:000000000000:orders' },
    });
    fireEvent.change(screen.getByLabelText('Role ARN'), {
      target: { value: 'arn:aws:iam::000000000000:role/scheduler-role' },
    });

    await waitFor(() => expect(saveButton.disabled).toBe(false));

    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'hourly',
        scheduleExpression: 'rate(5 minutes)',
        scheduleExpressionTimezone: 'UTC',
        state: 'ENABLED',
        flexibleTimeWindow: { mode: 'OFF' },
        target: expect.objectContaining({
          arn: 'arn:aws:sqs:us-east-1:000000000000:orders',
          roleArn: 'arn:aws:iam::000000000000:role/scheduler-role',
        }),
      }),
    );
  });

  it('pre-fills the edit form from the schedule details and makes the name read-only', async () => {
    detailsMock.useScheduleDetails.mockReturnValue({
      scheduleDetails: {
        name: 'hourly',
        arn: 'arn:hourly',
        groupName: 'orders',
        state: 'DISABLED',
        scheduleExpression: 'cron(0 12 * * ? *)',
        scheduleExpressionTimezone: 'UTC',
        actionAfterCompletion: 'NONE',
        flexibleTimeWindow: { mode: 'OFF' },
        target: { arn: 'arn:aws:sqs:us-east-1:000000000000:orders' },
      },
      loading: false,
      fetching: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <ScheduleFormDialog
        open
        groupName="orders"
        scheduleName="hourly"
        pending={false}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect((screen.getByLabelText('Schedule name') as HTMLInputElement).value).toBe('hourly'),
    );
    expect((screen.getByLabelText('Schedule name') as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText('Schedule expression') as HTMLInputElement).value).toBe(
      'cron(0 12 * * ? *)',
    );
    expect(screen.getByRole('button', { name: 'Save schedule' })).toBeTruthy();
  });

  it('warns about permanence and confirms schedule deletion', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <DeleteScheduleDialog
        scheduleName="hourly"
        pending={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByText('This permanently deletes the schedule. This action cannot be undone.'),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Delete schedule' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
