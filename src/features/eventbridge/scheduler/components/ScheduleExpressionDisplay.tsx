import { describeScheduleExpression } from '../lib/scheduleExpression';

interface ScheduleExpressionDisplayProps {
  expression?: string;
  timezone?: string;
}

export function ScheduleExpressionDisplay({
  expression,
  timezone,
}: ScheduleExpressionDisplayProps) {
  if (!expression) {
    return <p className="text-sm text-slate-500">No schedule expression</p>;
  }

  const description = describeScheduleExpression(expression);

  return (
    <div className="space-y-1">
      <p className="break-all font-mono text-sm text-cyan-300">{expression}</p>
      {description ? <p className="text-xs text-slate-400">{description}</p> : null}
      {timezone ? <p className="text-xs text-slate-500">Timezone: {timezone}</p> : null}
    </div>
  );
}
