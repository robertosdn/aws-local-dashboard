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
import type { S3Bucket } from '../types/s3';

interface BucketListProps {
  buckets: S3Bucket[];
  loading: boolean;
  onSelectBucket: (name: string) => void;
  onViewBucket: (name: string) => void;
  onDeleteBucket: (name: string) => void;
}

export function BucketList({ buckets, loading, onSelectBucket, onViewBucket, onDeleteBucket }: BucketListProps) {
  if (loading) {
    return (
      <Card className="bg-slate-900/50 p-8 text-center text-slate-400">Loading buckets...</Card>
    );
  }

  if (buckets.length === 0) {
    return (
      <Card className="bg-slate-900/50 p-12 text-center">
        <p className="text-slate-300">No S3 buckets found</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a bucket in the configured endpoint to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl">
      <Card className="min-w-[36rem] overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bucket</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-56 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buckets.map((bucket) => (
              <TableRow key={bucket.name}>
                <TableCell className="break-all font-mono text-cyan-300">{bucket.name}</TableCell>
                <TableCell className="text-sm text-slate-400">
                  {bucket.creationDate ? format(bucket.creationDate, 'yyyy-MM-dd HH:mm:ss') : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onViewBucket(bucket.name)}
                      aria-label={`View bucket ${bucket.name}`}
                    >
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectBucket(bucket.name)}
                      aria-label={`Open bucket ${bucket.name}`}
                    >
                      Open
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteBucket(bucket.name)}
                      aria-label={`Delete bucket ${bucket.name}`}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
