'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ScanFormProps {
  onScan: () => void;
  loading: boolean;
  hasMore: boolean;
  itemCount: number;
}

export function ScanForm({ onScan, loading, hasMore, itemCount }: ScanFormProps) {
  return (
    <div className="space-y-4">
      <Alert className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
        <AlertDescription className="text-sm">
          <strong>Scan operation:</strong> This reads items from the table and may require multiple
          requests to retrieve all data. Scans consume read capacity and can be slower than queries.
          Use Query by key when possible.
        </AlertDescription>
      </Alert>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm text-slate-400">
          Items retrieved: <span className="font-mono text-white">{itemCount}</span>
        </p>

        <Button onClick={onScan} disabled={loading} variant="outline" className="w-full">
          {loading ? 'Scanning...' : hasMore ? 'Restart Scan' : 'Scan Table'}
        </Button>
      </div>
    </div>
  );
}
