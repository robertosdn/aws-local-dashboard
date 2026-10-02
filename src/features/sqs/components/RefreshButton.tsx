'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

export function RefreshButton({ onClick, loading, className }: RefreshButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={loading}
      className={className}
      aria-label="Refresh"
    >
      <RefreshCw className={`h-4 w-4 transition-transform ${loading ? 'animate-spin' : ''}`} />
    </Button>
  );
}