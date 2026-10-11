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

interface DeleteScheduleDialogProps {
  scheduleName: string | null;
  pending: boolean;
  error?: unknown;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteScheduleDialog({
  scheduleName,
  pending,
  error,
  onOpenChange,
  onConfirm,
}: DeleteScheduleDialogProps) {
  return (
    <Dialog
      open={Boolean(scheduleName)}
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
          <DialogTitle>Delete schedule</DialogTitle>
          <DialogDescription>
            This permanently deletes the schedule. This action cannot be undone.
          </DialogDescription>
          {scheduleName ? (
            <p className="break-all text-sm text-cyan-300">
              Schedule: <code>{scheduleName}</code>
            </p>
          ) : null}
        </DialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-red-300">
            {error instanceof Error ? error.message : 'Unable to delete schedule.'}
          </p>
        ) : null}
        <DialogFooter>
          <DialogAction disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </DialogAction>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? 'Deleting...' : 'Delete schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
