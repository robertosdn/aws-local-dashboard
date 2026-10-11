import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RuleTargetInput } from '../types/eventbridge';

interface RuleTargetsEditorProps {
  targets: RuleTargetInput[];
  onChange: (targets: RuleTargetInput[]) => void;
}

export function RuleTargetsEditor({ targets, onChange }: RuleTargetsEditorProps) {
  const ids = targets.map((target) => target.id.trim()).filter(Boolean);
  const issues = targets.flatMap((target, index) => {
    const messages: string[] = [];
    if (!target.id.trim()) messages.push(`Target ${index + 1}: ID is required`);
    else if (ids.filter((id) => id === target.id.trim()).length > 1)
      messages.push(`Target ${index + 1}: IDs must be unique`);
    if (!target.arn.trim()) messages.push(`Target ${index + 1}: ARN is required`);
    else if (!/^arn:[^:]+:[^:]+:[^:]*:[^:]*:.+$/.test(target.arn.trim()))
      messages.push(`Target ${index + 1}: ARN format is invalid`);
    return messages;
  });

  const update = (index: number, field: keyof RuleTargetInput, value: string) => {
    onChange(
      targets.map((target, targetIndex) =>
        targetIndex === index ? { ...target, [field]: value } : target,
      ),
    );
  };

  return (
    <section className="space-y-3" aria-label="Rule targets">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">Targets</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange([...targets, { id: '', arn: '' }])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add target
        </Button>
      </div>
      {targets.map((target, index) => (
        <div
          key={`${index}-${target.id}`}
          className="grid gap-3 rounded-lg border border-slate-800 p-3 sm:grid-cols-2"
        >
          {(
            [
              ['id', 'Target ID'],
              ['arn', 'Target ARN'],
              ['roleArn', 'Role ARN'],
              ['input', 'Input'],
              ['inputPath', 'Input path'],
            ] as const
          ).map(([field, label]) => (
            <div key={field} className="space-y-1">
              <Label htmlFor={`target-${index}-${field}`}>
                {label}
                {field === 'roleArn' || field === 'input' || field === 'inputPath'
                  ? ' (optional)'
                  : ''}
              </Label>
              <Input
                id={`target-${index}-${field}`}
                value={target[field] ?? ''}
                onChange={(event) => update(index, field, event.target.value)}
                aria-invalid={
                  field === 'id'
                    ? !target.id.trim() || ids.filter((id) => id === target.id.trim()).length > 1
                    : field === 'arn'
                      ? !target.arn.trim() ||
                        !/^arn:[^:]+:[^:]+:[^:]*:[^:]*:.+$/.test(target.arn.trim())
                      : undefined
                }
              />
            </div>
          ))}
          <div className="flex items-end justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-red-400"
              aria-label={`Remove target ${index + 1}`}
              onClick={() => onChange(targets.filter((_, targetIndex) => targetIndex !== index))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove target
            </Button>
          </div>
        </div>
      ))}
      {targets.length === 0 ? (
        <p className="text-sm text-red-300">At least one target is required.</p>
      ) : null}
      {issues.map((message) => (
        <p key={message} className="text-sm text-red-300" role="alert">
          {message}
        </p>
      ))}
    </section>
  );
}
