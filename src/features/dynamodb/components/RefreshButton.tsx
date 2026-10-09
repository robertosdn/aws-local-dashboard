'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onClick: () => void;
  loading: boolean;
}

export function RefreshButton({ onClick, loading }: RefreshButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} disabled={loading}>
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );
}
