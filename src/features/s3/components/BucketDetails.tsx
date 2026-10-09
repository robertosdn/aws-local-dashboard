import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { S3BucketDetails } from '../types/s3';

interface BucketDetailsProps {
  bucketDetails: S3BucketDetails | undefined;
  loading: boolean;
  onBack: () => void;
}

const accessBlockSettings = [
  ['Block public ACLs', 'blockPublicAcls'],
  ['Ignore public ACLs', 'ignorePublicAcls'],
  ['Block public bucket policies', 'blockPublicPolicy'],
  ['Restrict public bucket policies', 'restrictPublicBuckets'],
] as const;

export function BucketDetails({ bucketDetails, loading, onBack }: BucketDetailsProps) {
  if (loading || !bucketDetails) {
    return (
      <section className="space-y-4" aria-label="Bucket configuration">
        <Button variant="ghost" onClick={onBack}>
          Back to buckets
        </Button>
        <Card className="space-y-4 bg-slate-900/50 p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Separator />
          <Skeleton className="h-16 w-full" />
        </Card>
      </section>
    );
  }

  const publicAccessBlock = bucketDetails.publicAccessBlock;

  return (
    <section
      aria-label={`Bucket details for ${bucketDetails.name}`}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
            Bucket configuration
          </p>
          <h3 className="mt-1 break-all font-mono text-xl font-semibold text-white">
            {bucketDetails.name}
          </h3>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to buckets
        </Button>
      </div>

      <Card className="space-y-5 bg-slate-900/50 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Created</p>
            <p className="mt-1 font-mono text-white">
              {bucketDetails.creationDate
                ? format(bucketDetails.creationDate, 'yyyy-MM-dd HH:mm:ss')
                : 'Unavailable'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Region</p>
            <p className="mt-1 font-mono text-white">{bucketDetails.region}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Versioning</p>
            <p className="mt-1 text-white">{bucketDetails.versioningStatus}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Default encryption</p>
            {bucketDetails.encryptionAlgorithms.length ? (
              <ul className="mt-1 space-y-1">
                {bucketDetails.encryptionAlgorithms.map((algorithm) => (
                  <li key={algorithm} className="font-mono text-white">
                    {algorithm}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-slate-400">Not configured</p>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium text-white">Public access block</h4>
          {!publicAccessBlock ? (
            <p className="mt-2 text-sm text-slate-400">Not configured</p>
          ) : (
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {accessBlockSettings.map(([label, setting]) => (
                <div key={setting} className="rounded border border-slate-700 p-3">
                  <dt className="text-sm text-slate-400">{label}</dt>
                  <dd className="mt-1 text-white">
                    {publicAccessBlock[setting] ? 'Enabled' : 'Disabled'}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Card>
    </section>
  );
}
