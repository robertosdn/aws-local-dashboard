import * as React from 'react';

import { cn } from '@/lib/utils';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  value: unknown;
}

function formatValue(value: unknown): { text: string; invalidJson: boolean } {
  if (value === undefined || value === null) {
    return { text: '', invalidJson: false };
  }

  if (typeof value === 'string') {
    try {
      return { text: JSON.stringify(JSON.parse(value), null, 2), invalidJson: false };
    } catch {
      return { text: value, invalidJson: true };
    }
  }

  try {
    const serialized = JSON.stringify(value, null, 2);
    if (typeof serialized !== 'string') {
      return { text: String(value), invalidJson: false };
    }
    return { text: serialized, invalidJson: false };
  } catch {
    return { text: String(value), invalidJson: true };
  }
}

const CodeBlock = React.forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ value, className, ...props }, ref) => {
    const { text, invalidJson } = formatValue(value);

    return (
      <div className="space-y-1">
        {invalidJson ? (
          <p className="text-xs text-amber-400">Invalid JSON — showing the raw value.</p>
        ) : null}
        <pre
          ref={ref}
          className={cn(
            'max-h-72 overflow-auto rounded-lg border border-slate-800 bg-slate-950/60 p-4 font-mono text-xs leading-relaxed text-slate-300',
            className,
          )}
          {...props}
        >
          <code>{text}</code>
        </pre>
      </div>
    );
  },
);
CodeBlock.displayName = 'CodeBlock';

export { CodeBlock };
