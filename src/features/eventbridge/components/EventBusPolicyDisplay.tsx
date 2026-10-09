import { CodeBlock } from '@/components/ui/code-block';

interface EventBusPolicyDisplayProps {
  policy?: string;
}

export function EventBusPolicyDisplay({ policy }: EventBusPolicyDisplayProps) {
  if (!policy) {
    return <p className="text-sm text-slate-500">No policy is configured for this event bus.</p>;
  }

  return <CodeBlock value={policy} />;
}
