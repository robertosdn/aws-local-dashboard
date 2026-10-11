import { useState } from 'react';
import { CodeBlock } from '@/components/ui/code-block';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { validateEventPattern } from '../lib/eventPattern';

interface EventPatternFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function EventPatternField({ value, onChange }: EventPatternFieldProps) {
  const [showPreview, setShowPreview] = useState(false);
  const currentResult = validateEventPattern(value);
  const errors = currentResult.issues.filter((entry) => entry.severity === 'error');
  const feedbackId = 'event-pattern-feedback';

  return (
    <div className="space-y-2">
      <Label htmlFor="event-pattern">Event pattern (optional; blank matches all events)</Label>
      <Textarea
        id="event-pattern"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={feedbackId}
        aria-invalid={errors.length > 0}
        className="min-h-40 font-mono"
        placeholder={'{"source":["app.orders"]}'}
      />
      <div id={feedbackId} aria-live="polite" role="status" className="space-y-1 text-sm">
        {currentResult.issues.map((entry, index) => (
          <p
            key={`${entry.path}-${index}`}
            className={entry.severity === 'error' ? 'text-red-300' : 'text-amber-300'}
          >
            {entry.path ? <code>{entry.path}: </code> : null}
            {entry.message}
          </p>
        ))}
        {currentResult.valid && currentResult.issues.length === 0 ? (
          <p className="text-emerald-300">Event pattern is valid</p>
        ) : null}
      </div>
      {currentResult.formatted ? (
        <div>
          <button
            type="button"
            className="text-xs text-cyan-300 underline"
            onClick={() => setShowPreview((shown) => !shown)}
          >
            {showPreview ? 'Hide formatted preview' : 'Preview formatted pattern'}
          </button>
          {showPreview ? (
            <div className="mt-2">
              <CodeBlock value={currentResult.formatted} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
