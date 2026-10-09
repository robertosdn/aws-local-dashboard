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

interface DeleteEventBusDialogProps {
  eventBusName: string | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteEventBusDialog({
  eventBusName,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteEventBusDialogProps) {
  return (
    <Dialog open={Boolean(eventBusName)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete event bus</DialogTitle>
          <DialogDescription>
            This permanently deletes the event bus and all of its rules. This action cannot be
            undone.
          </DialogDescription>
          {eventBusName ? (
            <p className="break-all text-sm text-cyan-300">
              Event bus: <code>{eventBusName}</code>
            </p>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <DialogAction onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </DialogAction>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
