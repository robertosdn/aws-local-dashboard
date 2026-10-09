import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DeleteEventBusDialog,
  EventBusTable,
  useDeleteEventBus,
  useEventBuses,
} from '@/features/eventbridge';

export default function EventBusesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageTokens, setPageTokens] = useState<Array<string | undefined>>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const cursor = pageTokens[pageIndex];
  const { eventBuses, nextToken, loading, fetching, error, refetch } = useEventBuses(cursor);
  const deleteMutation = useDeleteEventBus();

  const refresh = () => {
    void refetch();
  };

  const loadNextPage = () => {
    if (!nextToken) return;
    setPageTokens((tokens) => [...tokens.slice(0, pageIndex + 1), nextToken]);
    setPageIndex((index) => index + 1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.deleteEventBus({ name: deleteTarget });
      toast({
        title: 'Event bus deleted',
        description: `Event bus ${deleteTarget} was deleted.`,
        variant: 'success',
      });
      setDeleteTarget(null);
      if (pageIndex > 0 && eventBuses.length === 1) {
        setPageIndex((index) => Math.max(0, index - 1));
      } else {
        void refetch();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Failed to delete event bus',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">EventBridge</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Event Buses</h2>
        </div>
        <Button variant="outline" onClick={refresh} disabled={fetching}>
          {fetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error ? (
        <Alert className="border-red-500/50 bg-red-500/10 text-red-200" role="alert">
          <AlertDescription>
            <p>Failed to load event buses.</p>
            <p className="mt-1 break-all text-sm text-slate-300">{errorMessage}</p>
            <Button variant="outline" onClick={() => void refetch()} className="mt-3">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <EventBusTable
            eventBuses={eventBuses}
            loading={loading}
            onViewEventBus={(name) =>
              navigate(`/eventbridge/eventbuses/${encodeURIComponent(name)}`)
            }
            onDeleteEventBus={(name) => setDeleteTarget(name)}
          />

          {eventBuses.length > 0 ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
                disabled={pageIndex === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {pageIndex + 1}</span>
              <Button variant="outline" size="sm" onClick={loadNextPage} disabled={!nextToken}>
                Next
              </Button>
            </div>
          ) : null}
        </>
      )}

      <DeleteEventBusDialog
        eventBusName={deleteTarget}
        pending={deleteMutation.pending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.pending) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
