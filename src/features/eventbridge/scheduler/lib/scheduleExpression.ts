import {
  SCHEDULE_EXPRESSION_MAX_LENGTH,
  type ScheduleExpressionKind,
  type ScheduleExpressionValidationResult,
  type ScheduleValidationIssue,
} from '../types/scheduler';

function describeRate(body: string): string | null {
  const match = /^(\d+)\s+(second|minute|hour|day)s?$/.exec(body.trim());
  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2];
  const plural = value === 1 ? unit : `${unit}s`;

  return `Every ${value} ${plural}`;
}

function describeCron(body: string): string | null {
  const fields = body.trim().split(/\s+/);
  if (fields.length < 5) return null;

  const [minute, hour] = fields;

  if (minute === '*') {
    return 'Every minute';
  }

  if (/^\d+$/.test(minute) && hour === '*') {
    return `Every hour at minute ${minute.padStart(2, '0')}`;
  }

  if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    if (fields[2] === '*' && fields[3] === '*' && fields[4] === '?') {
      return `Every day at ${time}`;
    }

    return `Cron schedule at ${time}`;
  }

  return 'Cron schedule';
}

/**
 * Returns a best-effort human-readable description for common EventBridge
 * Scheduler expressions. Callers must still show the raw expression; this is
 * only a convenience hint.
 */
export function describeScheduleExpression(expression?: string): string | null {
  if (!expression) return null;

  const trimmed = expression.trim();

  if (trimmed.startsWith('rate(') && trimmed.endsWith(')')) {
    return describeRate(trimmed.slice('rate('.length, -1));
  }

  if (trimmed.startsWith('cron(') && trimmed.endsWith(')')) {
    return describeCron(trimmed.slice('cron('.length, -1));
  }

  if (trimmed.startsWith('at(') && trimmed.endsWith(')')) {
    return 'One-time schedule';
  }

  return null;
}

const RATE_UNITS = new Set(['minute', 'minutes', 'hour', 'hours', 'day', 'days']);
const MONTH_NAMES = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const SPECIAL_DAY_TOKEN = /^(l|lw|l-\d{1,2}|\d{1,2}w|\d{1,2}l|\d{1,2}#[1-5])$/i;

function errorIssue(path: string, message: string): ScheduleValidationIssue {
  return { path, message, severity: 'error' };
}

function warningIssue(path: string, message: string): ScheduleValidationIssue {
  return { path, message, severity: 'warning' };
}

function isValidFieldValue(token: string, min: number, max: number, names?: string[]): boolean {
  if (names && names.includes(token.toUpperCase())) return true;
  if (!/^\d+$/.test(token)) return false;
  const value = Number(token);
  return value >= min && value <= max;
}

function validateCronField(
  field: string,
  index: number,
  min: number,
  max: number,
  issues: ScheduleValidationIssue[],
  options: { names?: string[]; allowSpecialDay?: boolean } = {},
): void {
  const path = `fields[${index}]`;
  if (field === '*' || field === '?') return;

  const parts = field.split(',');
  if (parts.some((part) => part === '')) {
    issues.push(errorIssue(path, 'Cron fields cannot contain empty list entries'));
    return;
  }

  for (const part of parts) {
    if (part === '*') continue;
    if (options.allowSpecialDay && SPECIAL_DAY_TOKEN.test(part)) continue;

    const [rangePart, stepPart] = part.split('/');
    if (stepPart !== undefined && (!/^\d+$/.test(stepPart) || Number(stepPart) <= 0)) {
      issues.push(errorIssue(path, `Invalid step value "${part}"`));
      continue;
    }

    if (rangePart === '*') continue;

    if (rangePart.includes('-')) {
      const [start, end] = rangePart.split('-');
      if (
        !isValidFieldValue(start, min, max, options.names) ||
        !isValidFieldValue(end, min, max, options.names)
      ) {
        issues.push(errorIssue(path, `Value "${rangePart}" is out of range`));
      }
      continue;
    }

    if (!isValidFieldValue(rangePart, min, max, options.names)) {
      issues.push(errorIssue(path, `Value "${rangePart}" is out of range`));
    }
  }
}

function validateRate(body: string, issues: ScheduleValidationIssue[]): void {
  const parts = body.trim().split(/\s+/).filter(Boolean);
  if (parts.length !== 2) {
    issues.push(
      errorIssue('rate', 'rate(...) requires a value and a unit, for example rate(5 minutes)'),
    );
    return;
  }

  const [value, unit] = parts;
  if (!/^\d+$/.test(value) || Number(value) <= 0) {
    issues.push(errorIssue('value', 'rate value must be a positive integer'));
  }
  if (!RATE_UNITS.has(unit.toLowerCase())) {
    issues.push(errorIssue('unit', `Unsupported rate unit "${unit}"`));
  }
}

function validateCron(body: string, issues: ScheduleValidationIssue[]): void {
  const fields = body.trim().split(/\s+/).filter(Boolean);
  if (fields.length !== 6) {
    issues.push(
      errorIssue(
        'fields',
        'cron(...) requires six fields: minutes hours day-of-month month day-of-week year',
      ),
    );
    return;
  }

  validateCronField(fields[0], 0, 0, 59, issues);
  validateCronField(fields[1], 1, 0, 23, issues);
  validateCronField(fields[2], 2, 1, 31, issues, { allowSpecialDay: true });
  validateCronField(fields[3], 3, 1, 12, issues, { names: MONTH_NAMES });
  validateCronField(fields[4], 4, 1, 7, issues, { names: DAY_NAMES, allowSpecialDay: true });

  const year = fields[5];
  if (year !== '*' && (!/^\d{4}$/.test(year) || Number(year) < 1970 || Number(year) > 2199)) {
    issues.push(
      errorIssue('fields[5]', 'Year must be "*" or a four-digit year between 1970 and 2199'),
    );
  }

  const dayOfMonthIsQuestion = fields[2] === '?';
  const dayOfWeekIsQuestion = fields[4] === '?';
  if (dayOfMonthIsQuestion === dayOfWeekIsQuestion) {
    issues.push(
      errorIssue(
        'fields',
        'Exactly one of day-of-month or day-of-week must be "?" so the schedule is unambiguous',
      ),
    );
  }
}

function parseAtTimestamp(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second ?? '0'),
    ),
  );

  const matches =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day) &&
    date.getUTCHours() === Number(hour) &&
    date.getUTCMinutes() === Number(minute) &&
    date.getUTCSeconds() === Number(second ?? '0');

  return matches ? date : null;
}

function validateAt(body: string, issues: ScheduleValidationIssue[]): void {
  const value = body.trim();
  if (!value) {
    issues.push(
      errorIssue('at', 'at(...) requires a timestamp, for example at(2025-01-01T12:00:00)'),
    );
    return;
  }

  const date = parseAtTimestamp(value);
  if (!date) {
    issues.push(errorIssue('at', 'at(...) requires a timestamp in the form YYYY-MM-DDThh:mm:ss'));
    return;
  }

  if (date.getTime() < Date.now()) {
    issues.push(warningIssue('at', 'This one-time schedule is in the past'));
  }
}

/**
 * Validates an EventBridge Scheduler expression of the form at(...), rate(...), or cron(...).
 * Returns every issue it finds so the form can show them together.
 */
export function validateScheduleExpression(value: string): ScheduleExpressionValidationResult {
  if (value.length > SCHEDULE_EXPRESSION_MAX_LENGTH) {
    return {
      valid: false,
      issues: [
        errorIssue(
          '',
          `Schedule expression cannot exceed ${SCHEDULE_EXPRESSION_MAX_LENGTH} characters`,
        ),
      ],
    };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, issues: [errorIssue('', 'Schedule expression is required')] };
  }

  const match = /^([A-Za-z]+)\(([^)]*)\)$/.exec(trimmed);
  if (!match) {
    return {
      valid: false,
      issues: [errorIssue('', 'Schedule expression must be at(...), rate(...), or cron(...)')],
    };
  }

  const kind = match[1].toLowerCase();
  if (kind !== 'at' && kind !== 'rate' && kind !== 'cron') {
    return {
      valid: false,
      issues: [errorIssue('', `Unsupported schedule expression type "${match[1]}"`)],
    };
  }

  const issues: ScheduleValidationIssue[] = [];
  const body = match[2];
  if (kind === 'rate') validateRate(body, issues);
  else if (kind === 'cron') validateCron(body, issues);
  else validateAt(body, issues);

  return {
    valid: !issues.some((entry) => entry.severity === 'error'),
    kind: kind as ScheduleExpressionKind,
    description: describeScheduleExpression(trimmed) ?? undefined,
    issues,
  };
}

const ALWAYS_VALID_TIME_ZONES = new Set(['utc', 'gmt', 'etc/utc', 'etc/gmt']);

function getSupportedTimeZones(): Set<string> | null {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
  if (typeof intl.supportedValuesOf !== 'function') return null;

  try {
    return new Set(intl.supportedValuesOf('timeZone').map((zone) => zone.toLowerCase()));
  } catch {
    return null;
  }
}

/**
 * Validates an IANA time zone name. Falls back to a structural check when the
 * browser does not expose `Intl.supportedValuesOf`.
 */
export function validateScheduleTimezone(value: string): ScheduleValidationIssue[] {
  const trimmed = value.trim();
  if (!trimmed) return [errorIssue('timezone', 'Time zone is required')];
  if (ALWAYS_VALID_TIME_ZONES.has(trimmed.toLowerCase())) return [];

  const supported = getSupportedTimeZones();
  if (supported) {
    return supported.has(trimmed.toLowerCase())
      ? []
      : [errorIssue('timezone', `"${trimmed}" is not a recognized IANA time zone`)];
  }

  return /^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+)+$/.test(trimmed)
    ? []
    : [errorIssue('timezone', `"${trimmed}" is not a recognized IANA time zone`)];
}
