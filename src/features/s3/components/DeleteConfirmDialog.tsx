import {
  Dialog,
  DialogAction,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  target:
    { kind: 'bucket'; name: string } | { kind: 'object'; bucketName: string; key: string } | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  target,
  pending,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const isBucket = target?.kind === 'bucket';
  const title = isBucket ? 'Delete empty bucket' : 'Delete object';

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isBucket
              ? 'Only an empty bucket can be deleted. Its objects will not be deleted automatically.'
              : 'This permanently deletes the selected object.'}
          </DialogDescription>
          {target?.kind === 'bucket' ? (
            <p className="break-all text-sm text-cyan-300">
              Bucket: <code>{target.name}</code>
            </p>
          ) : target?.kind === 'object' ? (
            <div className="space-y-1 text-sm text-slate-300">
              <p className="break-all">
                Bucket: <code>{target.bucketName}</code>
              </p>
              <p className="break-all">
                Object key: <code>{target.key}</code>
              </p>
            </div>
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
