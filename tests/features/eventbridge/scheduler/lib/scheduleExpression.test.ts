import { describe, expect, it } from 'vitest';
import {
  describeScheduleExpression,
  validateScheduleExpression,
  validateScheduleTimezone,
} from '@/features/eventbridge/scheduler/lib/scheduleExpression';
import { SCHEDULE_EXPRESSION_MAX_LENGTH } from '@/features/eventbridge/scheduler/types/scheduler';

describe('validateScheduleExpression', () => {
  it('accepts rate expressions and reports the interval', () => {
    const result = validateScheduleExpression('rate(5 minutes)');

    expect(result.valid).toBe(true);
    expect(result.kind).toBe('rate');
    expect(result.description).toBe('Every 5 minutes');
    expect(result.issues).toEqual([]);
  });

  it('accepts cron and at expressions', () => {
    const cron = validateScheduleExpression('cron(0 12 * * ? *)');
    expect(cron.kind).toBe('cron');
    expect(cron.valid).toBe(true);

    const at = validateScheduleExpression('at(2999-01-01T12:00:00)');
    expect(at.kind).toBe('at');
    expect(at.valid).toBe(true);
  });

  it('rejects an empty expression', () => {
    const result = validateScheduleExpression('   ');

    expect(result.valid).toBe(false);
    expect(result.issues[0].message).toBe('Schedule expression is required');
  });

  it('rejects unsupported expression forms', () => {
    expect(validateScheduleExpression('every 5 minutes').issues[0].message).toContain('at(...)');
    expect(validateScheduleExpression('daily(5)').issues[0].message).toContain('Unsupported');
  });

  it('rejects a rate expression with a bad value or unit', () => {
    const result = validateScheduleExpression('rate(0 weeks)');

    expect(result.valid).toBe(false);
    expect(result.issues.map((entry) => entry.path)).toEqual(
      expect.arrayContaining(['value', 'unit']),
    );
  });

  it('rejects a cron expression unless exactly one day field is "?"', () => {
    const result = validateScheduleExpression('cron(0 12 * * * *)');

    expect(result.valid).toBe(false);
    expect(result.issues.some((entry) => entry.message.toLowerCase().includes('exactly one'))).toBe(
      true,
    );
  });

  it('rejects cron field values outside their range and wrong field counts', () => {
    const outOfRange = validateScheduleExpression('cron(99 12 * * ? *)');
    expect(outOfRange.valid).toBe(false);
    expect(outOfRange.issues[0].path).toBe('fields[0]');

    expect(validateScheduleExpression('cron(0 12 * ?)').issues[0].path).toBe('fields');
  });

  it('accepts named months and weekdays and special day tokens', () => {
    expect(validateScheduleExpression('cron(0 9 ? JAN MON 2030)').valid).toBe(true);
    expect(validateScheduleExpression('cron(0 0 L * ? *)').valid).toBe(true);
  });

  it('warns instead of failing when an at() timestamp is in the past', () => {
    const result = validateScheduleExpression('at(2000-01-01T00:00:00)');

    expect(result.valid).toBe(true);
    expect(result.issues[0].severity).toBe('warning');
  });

  it('rejects a malformed at() timestamp', () => {
    const result = validateScheduleExpression('at(2024-13-45T99:00:00)');

    expect(result.valid).toBe(false);
    expect(result.kind).toBe('at');
  });

  it('enforces the expression length limit', () => {
    const result = validateScheduleExpression('x'.repeat(SCHEDULE_EXPRESSION_MAX_LENGTH + 1));

    expect(result.valid).toBe(false);
    expect(result.issues[0].message).toContain(`${SCHEDULE_EXPRESSION_MAX_LENGTH}`);
  });
});

describe('validateScheduleTimezone', () => {
  it('accepts common IANA zones and the UTC alias', () => {
    expect(validateScheduleTimezone('UTC')).toEqual([]);
    expect(validateScheduleTimezone('America/Sao_Paulo')).toEqual([]);
  });

  it('rejects empty and unrecognized zones', () => {
    expect(validateScheduleTimezone('  ')[0].message).toBe('Time zone is required');

    const unsupported = validateScheduleTimezone('Not/AZone');
    expect(unsupported.length).toBe(1);
    expect(unsupported[0].severity).toBe('error');
  });
});

describe('describeScheduleExpression', () => {
  it('still describes common expressions', () => {
    expect(describeScheduleExpression('rate(1 hour)')).toBe('Every 1 hour');
    expect(describeScheduleExpression('cron(0 12 * * ? *)')).toBe('Every day at 12:00');
    expect(describeScheduleExpression('at(2025-01-01T00:00:00)')).toBe('One-time schedule');
    expect(describeScheduleExpression(undefined)).toBeNull();
  });
});
