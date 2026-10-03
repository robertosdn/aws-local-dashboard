'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & {
    pressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
  }
>(({ className, pressed, onPressedChange, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    checked={pressed}
    onCheckedChange={onPressedChange}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-slate-700',
      className
    )}
    {...props}
  >
    <TogglePrimitive.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      )}
    />
  </TogglePrimitive.Root>
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };