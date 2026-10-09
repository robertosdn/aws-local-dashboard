import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  BucketContents,
  BucketList,
  DeleteConfirmDialog,
  BucketDetails,
  useBucketObjects,
  useBuckets,
  useBucketDetails,
  useDeleteBucket,
  useDeleteObject,
} from '@/features/s3';
import type { S3Bucket } from '@/features/s3';

type DeleteTarget =
  { kind: 'bucket'; name: string } | { kind: 'object'; bucketName: string; key: string };

export default function S3Page() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [viewingBucket, setViewingBucket] = useState<S3Bucket | null>(null);
  const [pageTokens, setPageTokens] = useState<Array<string | undefined>>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const { toast } = useToast();

  const {
    buckets,
    loading: bucketsLoading,
    fetching: bucketsFetching,
    error: bucketsError,
    refetch: refetchBuckets,
  } = useBuckets();
  const {
    bucketDetails,
    loading: bucketDetailsLoading,
    fetching: bucketDetailsFetching,
    error: bucketDetailsError,
    refetch: refetchBucketDetails,
  } = useBucketDetails(viewingBucket);
  const cursor = pageTokens[pageIndex];
  const {
    objects,
    nextContinuationToken,
    isTruncated,
    loading: objectsLoading,
    fetching: objectsFetching,
    error: objectsError,
    refetch: refetchObjects,
  } = useBucketObjects(selectedBucket, cursor);
  const deleteBucketMutation = useDeleteBucket();
  const deleteObjectMutation = useDeleteObject();
  const deletePending = deleteBucketMutation.pending || deleteObjectMutation.pending;
  const activeFetching = viewingBucket
    ? bucketDetailsFetching
    : selectedBucket
      ? objectsFetching
      : bucketsFetching;
  const activeRefetch = viewingBucket
    ? refetchBucketDetails
    : selectedBucket
      ? refetchObjects
      : refetchBuckets;

  const openBucket = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setPageTokens([undefined]);
    setPageIndex(0);
  };

  const viewBucket = (bucketName: string) => {
    const bucket = buckets.find(({ name }) => name === bucketName);
    if (bucket) {
      setViewingBucket(bucket);
      setSelectedBucket(null);
    }
  };

  const refresh = () => {
    void activeRefetch();
  };

  const loadNextPage = () => {
    if (!nextContinuationToken || !isTruncated) return;
    setPageTokens((tokens) => [...tokens.slice(0, pageIndex + 1), nextContinuationToken]);
    setPageIndex((index) => index + 1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.kind === 'bucket') {
        await deleteBucketMutation.deleteBucket({ bucketName: deleteTarget.name });
        toast({
          title: 'Bucket deleted',
          description: `Bucket ${deleteTarget.name} was deleted.`,
          variant: 'success',
        });
        setDeleteTarget(null);
        if (selectedBucket === deleteTarget.name) setSelectedBucket(null);
      } else {
        await deleteObjectMutation.deleteObject({
          bucketName: deleteTarget.bucketName,
          key: deleteTarget.key,
        });
        toast({
          title: 'Object deleted',
          description: `Object ${deleteTarget.key} was deleted.`,
          variant: 'success',
        });
        setDeleteTarget(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const isNonEmptyBucket =
        deleteTarget.kind === 'bucket' && /bucket.?not.?empty|not empty/i.test(message);
      toast({
        title:
          deleteTarget.kind === 'bucket' ? 'Failed to delete bucket' : 'Failed to delete object',
        description: isNonEmptyBucket
          ? `${message}. Delete all objects from the bucket first; bucket deletion never removes them automatically.`
          : message,
        variant: 'destructive',
      });
    }
  };

  const bucketsErrorMessage =
    bucketsError instanceof Error ? bucketsError.message : 'Unknown error';
  const objectsErrorMessage =
    objectsError instanceof Error ? objectsError.message : 'Unknown error';

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">S3</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Buckets</h2>
        </div>
        <Button variant="outline" onClick={refresh} disabled={activeFetching}>
          {activeFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {viewingBucket ? (
        bucketDetailsError ? (
          <Card className="space-y-3 border-red-500/50 bg-red-500/10 p-6" role="alert">
            <div>
              <p className="font-medium text-red-300">
                Failed to load configuration for {viewingBucket.name}
              </p>
              <p className="mt-1 break-all text-sm text-slate-300">
                {bucketDetailsError instanceof Error
                  ? bucketDetailsError.message
                  : 'Unknown error'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void refetchBucketDetails()}>
                Retry
              </Button>
              <Button variant="ghost" onClick={() => setViewingBucket(null)}>
                Back to buckets
              </Button>
            </div>
          </Card>
        ) : (
          <BucketDetails
            bucketDetails={bucketDetails}
            loading={bucketDetailsLoading}
            onBack={() => setViewingBucket(null)}
          />
        )
      ) : selectedBucket ? (
        objectsError ? (
          <Card className="space-y-3 border-red-500/50 bg-red-500/10 p-6" role="alert">
            <div>
              <p className="font-medium text-red-300">Failed to load objects in {selectedBucket}</p>
              <p className="mt-1 break-all text-sm text-slate-300">{objectsErrorMessage}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void refetchObjects()}>
                Retry
              </Button>
              <Button variant="ghost" onClick={() => setSelectedBucket(null)}>
                Back to buckets
              </Button>
            </div>
          </Card>
        ) : (
          <BucketContents
            bucketName={selectedBucket}
            objects={objects}
            loading={objectsLoading}
            hasPreviousPage={pageIndex > 0}
            hasNextPage={Boolean(isTruncated && nextContinuationToken)}
            onBack={() => setSelectedBucket(null)}
            onDeleteObject={(key) =>
              setDeleteTarget({ kind: 'object', bucketName: selectedBucket, key })
            }
            onPreviousPage={() => setPageIndex((index) => Math.max(0, index - 1))}
            onNextPage={loadNextPage}
            onRetry={() => void refetchObjects()}
          />
        )
      ) : bucketsError ? (
        <Alert className="border-red-500/50 bg-red-500/10 text-red-200" role="alert">
          <AlertDescription>
            <p>Failed to load S3 buckets.</p>
            <p className="mt-1 break-all text-sm text-slate-300">{bucketsErrorMessage}</p>
            <Button variant="outline" onClick={() => void refetchBuckets()} className="mt-3">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <BucketList
          buckets={buckets}
          loading={bucketsLoading}
          onSelectBucket={openBucket}
          onViewBucket={viewBucket}
          onDeleteBucket={(name) => setDeleteTarget({ kind: 'bucket', name })}
        />
      )}

      <DeleteConfirmDialog
        target={deleteTarget}
        pending={deletePending}
        onOpenChange={(open) => {
          if (!open && !deletePending) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
