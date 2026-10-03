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
  comingSoon?: boolean;
};

export const navigation: NavigationItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/queues', label: 'Queues', icon: MessageSquare },
  { path: '/s3', label: 'S3', icon: HardDrive, comingSoon: true },
  { path: '/lambda', label: 'Lambda', icon: FunctionSquare },
  { path: '/dynamodb', label: 'DynamoDB', icon: Database, comingSoon: true },
  { path: '/settings', label: 'Settings', icon: Settings },
];
