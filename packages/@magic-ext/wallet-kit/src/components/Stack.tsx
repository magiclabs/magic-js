import React from 'react';
import { cn } from '@magiclabs/ui-components';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const VStack = React.forwardRef<HTMLDivElement, DivProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} {...props} className={cn('flex flex-col items-center justify-start', className)}>
    {children}
  </div>
));
VStack.displayName = 'VStack';

export const HStack = React.forwardRef<HTMLDivElement, DivProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} {...props} className={cn('flex flex-row items-center justify-start', className)}>
    {children}
  </div>
));
HStack.displayName = 'HStack';

export const Center = React.forwardRef<HTMLDivElement, DivProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} {...props} className={cn('flex items-center justify-center', className)}>
    {children}
  </div>
));
Center.displayName = 'Center';
