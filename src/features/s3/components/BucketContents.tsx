import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { S3Object } from '../types/s3';
import { formatSize } from './formatSize';

interface BucketContentsProps {
  bucketName: string;
  objects: S3Object[];
  loading: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onBack: () => void;
  onDeleteObject: (key: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onRetry: () => void;
}

export function BucketContents({
  bucketName,
  objects,
  loading,
  hasPreviousPage,
  hasNextPage,
  onBack,
  onDeleteObject,
  onPreviousPage,
  onNextPage,
  onRetry,
}: BucketContentsProps) {
  return (
    <section aria-label={`Objects in ${bucketName}`} className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
            Bucket contents
          </p>
          <h3 className="mt-1 break-all text-xl font-semibold text-white">{bucketName}</h3>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to buckets
        </Button>
      </div>

      {loading ? (
        <Card className="bg-slate-900/50 p-8 text-center text-slate-400">Loading objects...</Card>
      ) : objects.length === 0 ? (
        <Card className="bg-slate-900/50 p-12 text-center">
          <p className="text-slate-300">This bucket is empty</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <Card className="min-w-[42rem] overflow-hidden bg-slate-900/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Object key</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {objects.map((object) => (
                  <TableRow key={object.key}>
                    <TableCell className="max-w-[28rem] break-all font-mono text-sm text-cyan-200">
                      <span title={object.key}>{object.key}</span>
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {formatSize(object.size)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">
                      {object.lastModified
                        ? format(object.lastModified, 'yyyy-MM-dd HH:mm:ss')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteObject(object.key)}
                        aria-label={`Delete object ${object.key}`}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onPreviousPage} disabled={!hasPreviousPage || loading}>
          Previous page
        </Button>
        {hasNextPage && (
          <Button variant="secondary" onClick={onNextPage} disabled={loading}>
            Next page
          </Button>
        )}
        {!hasNextPage && objects.length > 0 && (
          <span className="text-sm text-slate-500">End of object list</span>
        )}
      </div>
      {!loading && objects.length === 0 && (
        <Button variant="outline" onClick={onRetry}>
          Refresh objects
        </Button>
      )}
    </section>
  );
}
