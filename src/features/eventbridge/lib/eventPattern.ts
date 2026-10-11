import type { EventPatternIssue, EventPatternValidationResult } from '../types/eventbridge';

export const EVENT_PATTERN_MAX_LENGTH = 4096;

const SIMPLE_OPERATORS = new Set([
  'prefix',
  'suffix',
  'equals-ignore-case',
  'wildcard',
  'exists',
  'cidr',
  'anything-but',
  'numeric',
]);
const NUMERIC_OPERATORS = new Set(['=', '>', '>=', '<', '<=']);
const ANYTHING_BUT_NESTED_OPERATORS = new Set(['prefix', 'suffix', 'equals-ignore-case', 'cidr']);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatPath(parent: string, key: string | number): string {
  return typeof key === 'number' ? `${parent}[${key}]` : parent ? `${parent}.${key}` : key;
}

function issue(path: string, message: string): EventPatternIssue {
  return { path, message, severity: 'error' };
}

function isPrimitive(value: unknown): value is string | number | boolean {
  return ['string', 'number', 'boolean'].includes(typeof value);
}

function isValidCidr(value: string): boolean {
  const slash = value.lastIndexOf('/');
  if (slash < 1) return false;
  const address = value.slice(0, slash);
  const prefix = Number(value.slice(slash + 1));
  if (!Number.isInteger(prefix)) return false;
  if (address.includes(':')) return prefix >= 0 && prefix <= 128 && /^[0-9a-fA-F:]+$/.test(address);
  if (prefix < 0 || prefix > 32) return false;
  const parts = address.split('.');
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function validateOperator(
  key: string,
  value: unknown,
  path: string,
  issues: EventPatternIssue[],
): void {
  if (key === 'exists') {
    if (typeof value !== 'boolean')
      issues.push(issue(path, 'The exists operator requires a boolean value'));
    return;
  }

  if (key === 'numeric') {
    if (!Array.isArray(value) || value.length < 2 || value.length % 2 !== 0) {
      issues.push(issue(path, 'The numeric operator requires operator/number pairs'));
      return;
    }
    for (let index = 0; index < value.length; index += 2) {
      if (typeof value[index] !== 'string' || !NUMERIC_OPERATORS.has(value[index] as string)) {
        issues.push(issue(formatPath(path, index), 'Unsupported numeric comparison operator'));
      }
      if (typeof value[index + 1] !== 'number' || !Number.isFinite(value[index + 1])) {
        issues.push(
          issue(formatPath(path, index + 1), 'Numeric comparisons require a finite number'),
        );
      }
    }
    return;
  }

  if (key === 'anything-but') {
    if (Array.isArray(value)) {
      if (value.length === 0)
        issues.push(issue(path, 'The anything-but operator requires at least one value'));
      value.forEach((item, index) => {
        if (!isPrimitive(item))
          issues.push(
            issue(
              formatPath(path, index),
              'anything-but values must be strings, numbers, or booleans',
            ),
          );
      });
    } else if (isObject(value)) {
      const entries = Object.entries(value);
      if (entries.length !== 1 || !ANYTHING_BUT_NESTED_OPERATORS.has(entries[0]?.[0] ?? '')) {
        issues.push(issue(path, 'anything-but accepts one supported nested operator'));
      } else {
        const [nestedKey, nestedValue] = entries[0];
        if (typeof nestedValue !== 'string')
          issues.push(issue(formatPath(path, nestedKey), `${nestedKey} requires a string value`));
      }
    } else if (!isPrimitive(value)) {
      issues.push(
        issue(
          path,
          'The anything-but operator requires a primitive, non-empty array, or supported nested operator',
        ),
      );
    }
    return;
  }

  if (key === 'prefix' || key === 'suffix' || key === 'equals-ignore-case') {
    if (typeof value !== 'string')
      issues.push(issue(path, `The ${key} operator requires a string value`));
    return;
  }

  if (key === 'wildcard') {
    if (typeof value !== 'string' || !/[*?]/.test(value)) {
      issues.push(issue(path, 'The wildcard operator requires a string containing * or ?'));
    }
    return;
  }

  if (key === 'cidr' && (typeof value !== 'string' || !isValidCidr(value))) {
    issues.push(issue(path, 'The cidr operator requires a valid IPv4 or IPv6 CIDR value'));
  }
}

function walk(
  value: unknown,
  path: string,
  issues: EventPatternIssue[],
  matchExpression = false,
): void {
  if (value === null) {
    issues.push(issue(path, 'null is not a valid match value'));
    return;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      issues.push(issue(path, 'Match arrays must contain at least one value'));
      return;
    }
    value.forEach((item, index) => {
      const itemPath = formatPath(path, index);
      if (Array.isArray(item)) issues.push(issue(itemPath, 'Nested arrays are not supported'));
      else walk(item, itemPath, issues, isObject(item));
    });
    return;
  }
  if (!isObject(value)) return;

  const entries = Object.entries(value);
  if (matchExpression && entries.length === 1) {
    const [key, operatorValue] = entries[0];
    if (!SIMPLE_OPERATORS.has(key)) {
      issues.push(issue(formatPath(path, key), `Unknown matching operator "${key}"`));
      return;
    }
    validateOperator(key, operatorValue, formatPath(path, key), issues);
    return;
  }
  if (entries.length === 1 && SIMPLE_OPERATORS.has(entries[0][0])) {
    const [key, operatorValue] = entries[0];
    validateOperator(key, operatorValue, formatPath(path, key), issues);
    return;
  }

  for (const [key, nestedValue] of entries) {
    const nestedPath = formatPath(path, key);
    if (key === '$or') {
      if (
        !Array.isArray(nestedValue) ||
        nestedValue.length === 0 ||
        nestedValue.some((item) => !isObject(item))
      ) {
        issues.push(issue(nestedPath, '$or requires a non-empty array of pattern objects'));
      } else {
        nestedValue.forEach((item, index) =>
          walk(item, formatPath(nestedPath, index), issues, true),
        );
      }
    } else if (key.startsWith('$')) {
      issues.push(issue(nestedPath, `Unsupported event pattern operator "${key}"`));
    } else {
      walk(nestedValue, nestedPath, issues, Array.isArray(nestedValue));
    }
  }
}

export function validateEventPattern(value: string): EventPatternValidationResult {
  if (value.length > EVENT_PATTERN_MAX_LENGTH) {
    return {
      valid: false,
      issues: [issue('', `Event pattern cannot exceed ${EVENT_PATTERN_MAX_LENGTH} characters`)],
    };
  }
  const trimmed = value.trim();
  if (!trimmed) return { valid: true, issues: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    return { valid: false, issues: [issue('', `Invalid JSON: ${message}`)] };
  }

  const formatted = JSON.stringify(parsed, null, 2);
  if (!isObject(parsed)) {
    return {
      valid: false,
      parsed,
      formatted,
      issues: [issue('', 'Event pattern must be a JSON object')],
    };
  }

  const issues: EventPatternIssue[] = [];
  if (Object.keys(parsed).length === 0) {
    issues.push({ path: '', message: 'This pattern matches all events', severity: 'warning' });
  } else {
    walk(parsed, '', issues);
  }
  issues.sort((left, right) => left.path.localeCompare(right.path));
  return { valid: !issues.some((entry) => entry.severity === 'error'), parsed, formatted, issues };
}

export function formatEventPattern(value: string): string | null {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return null;
  }
}
