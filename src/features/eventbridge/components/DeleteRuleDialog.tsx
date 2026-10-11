import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogAction,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteRuleDialogProps {
  ruleName: string | null;
  pending: boolean;
  error?: unknown;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteRuleDialog({
  ruleName,
  pending,
  error,
  onOpenChange,
  onConfirm,
}: DeleteRuleDialogProps) {
  return (
    <Dialog
      open={Boolean(ruleName)}
      onOpenChange={(open) => {
        if (!pending) onOpenChange(open);
      }}
    >
      <DialogContent
        onInteractOutside={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Delete rule</DialogTitle>
          <DialogDescription>
            This permanently deletes the rule and removes its targets. This action cannot be undone.
          </DialogDescription>
          {ruleName ? (
            <p className="break-all text-sm text-cyan-300">
              Rule: <code>{ruleName}</code>
            </p>
          ) : null}
        </DialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-red-300">
            {error instanceof Error ? error.message : 'Unable to delete rule.'}
          </p>
        ) : null}
        <DialogFooter>
          <DialogAction disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </DialogAction>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? 'Deleting...' : 'Delete rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
