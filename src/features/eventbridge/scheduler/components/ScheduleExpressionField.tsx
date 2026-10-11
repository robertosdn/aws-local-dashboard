import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateScheduleExpression, validateScheduleTimezone } from '../lib/scheduleExpression';

interface ScheduleExpressionFieldProps {
  expression: string;
  timezone: string;
  onExpressionChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

export function ScheduleExpressionField({
  expression,
  timezone,
  onExpressionChange,
  onTimezoneChange,
}: ScheduleExpressionFieldProps) {
  const expressionResult = validateScheduleExpression(expression);
  const timezoneIssues = validateScheduleTimezone(timezone);
  const expressionErrors = expressionResult.issues.filter((entry) => entry.severity === 'error');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="schedule-expression">Schedule expression</Label>
        <Input
          id="schedule-expression"
          value={expression}
          onChange={(event) => onExpressionChange(event.target.value)}
          aria-describedby="schedule-expression-feedback"
          aria-invalid={expressionErrors.length > 0}
          className="font-mono"
          placeholder="rate(5 minutes)"
        />
        <div
          id="schedule-expression-feedback"
          role="status"
          aria-live="polite"
          className="space-y-1 text-sm"
        >
          {expressionResult.issues.map((entry, index) => (
            <p
              key={`${entry.path}-${index}`}
              className={entry.severity === 'error' ? 'text-red-300' : 'text-amber-300'}
            >
              {entry.path ? <code>{entry.path}: </code> : null}
              {entry.message}
            </p>
          ))}
          {expressionResult.valid && expressionResult.description ? (
            <p className="text-emerald-300">{expressionResult.description}</p>
          ) : null}
          {expressionResult.valid && !expressionResult.description ? (
            <p className="text-emerald-300">Schedule expression is valid</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedule-timezone">Time zone</Label>
        <Input
          id="schedule-timezone"
          value={timezone}
          onChange={(event) => onTimezoneChange(event.target.value)}
          aria-describedby="schedule-timezone-feedback"
          aria-invalid={timezoneIssues.length > 0}
          placeholder="UTC"
        />
        <div
          id="schedule-timezone-feedback"
          role="status"
          aria-live="polite"
          className="space-y-1 text-sm"
        >
          {timezoneIssues.map((entry, index) => (
            <p key={`${entry.path}-${index}`} className="text-red-300">
              {entry.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
