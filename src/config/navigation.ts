import {
  Database,
  FunctionSquare,
  HardDrive,
  LayoutDashboard,
  MessageSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type NavigationItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

export const navigation: NavigationItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/queues', label: 'Queues', icon: MessageSquare },
  { path: '/s3', label: 'S3', icon: HardDrive },
  { path: '/lambda', label: 'Lambda', icon: FunctionSquare },
  { path: '/dynamodb', label: 'DynamoDB', icon: Database },
  { path: '/settings', label: 'Settings', icon: Settings },
];
