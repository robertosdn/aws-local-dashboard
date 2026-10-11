import { describe, expect, it } from 'vitest';
import {
  EVENT_PATTERN_MAX_LENGTH,
  formatEventPattern,
  validateEventPattern,
} from '@/features/eventbridge/lib/eventPattern';

describe('validateEventPattern', () => {
  it('accepts a basic event pattern and returns a formatted preview', () => {
    const result = validateEventPattern('{"source":["app.orders"],"detail":{"state":["created"]}}');
    expect(result.valid).toBe(true);
    expect(result.formatted).toContain('\n  "source"');
  });

  it('reports invalid JSON with parser details', () => {
    const result = validateEventPattern('{"source": [}');
    expect(result.valid).toBe(false);
    expect(result.issues[0].message).toMatch(/Invalid JSON/);
  });

  it('rejects non-object roots and empty match arrays', () => {
    expect(validateEventPattern('[]').issues[0].message).toBe(
      'Event pattern must be a JSON object',
    );
    const empty = validateEventPattern('{"source":[]}');
    expect(empty.valid).toBe(false);
    expect(empty.issues[0].path).toBe('source');
  });

  it('warns on empty object patterns without blocking save', () => {
    const result = validateEventPattern('{}');
    expect(result.valid).toBe(true);
    expect(result.issues[0].severity).toBe('warning');
  });

  it('collects nested array, null, unknown operator, and $or errors', () => {
    const result = validateEventPattern(
      '{"detail":{"a":[[1]],"b":[null],"c":{"$bad":true}},"$or":[]}',
    );
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThanOrEqual(4);
  });

  it('validates supported matching operators', () => {
    expect(validateEventPattern('{"source":[{"prefix":"app."}]}').valid).toBe(true);
    expect(validateEventPattern('{"detail":{"count":[{"numeric":[">",2]}]}}').valid).toBe(true);
    expect(validateEventPattern('{"detail":{"address":[{"cidr":"10.0.0.0/8"}]}}').valid).toBe(true);
    expect(validateEventPattern('{"source":[{"wildcard":"app.*"}]}').valid).toBe(true);
  });

  it('rejects malformed operator values', () => {
    const result = validateEventPattern(
      '{"detail":{"ok":[{"exists":"yes"}],"count":[{"numeric":["approx",1]}]}}',
    );
    expect(result.valid).toBe(false);
    expect(result.issues.some((entry) => entry.message.includes('exists'))).toBe(true);
    expect(result.issues.some((entry) => entry.message.includes('numeric'))).toBe(true);
  });

  it('allows blank patterns to match all events', () => {
    expect(validateEventPattern('  ')).toEqual({ valid: true, issues: [] });
  });

  it('enforces pattern size before parsing', () => {
    const result = validateEventPattern(' '.repeat(EVENT_PATTERN_MAX_LENGTH + 1));
    expect(result.valid).toBe(false);
    expect(result.issues[0].message).toContain(`${EVENT_PATTERN_MAX_LENGTH}`);
  });

  it('formats valid JSON without changing the input', () => {
    const input = '{ "source" : ["app.orders"] }';
    expect(formatEventPattern(input)).toBe('{\n  "source": [\n    "app.orders"\n  ]\n}');
    expect(input).toBe('{ "source" : ["app.orders"] }');
    expect(formatEventPattern('nope')).toBeNull();
  });
});
