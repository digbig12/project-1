'use client';

import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // @ts-ignore - Dynamic lookup
  const IconComponent = LucideIcons[name] || LucideIcons.Circle;
  return <IconComponent {...props} />;
};
