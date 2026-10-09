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
