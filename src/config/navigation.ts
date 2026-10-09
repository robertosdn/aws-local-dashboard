import {
  Database,
  FunctionSquare,
  HardDrive,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Clock3,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type NavigationItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  disabled?: boolean;
};

export const navigation: NavigationItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/queues', label: 'SQS', icon: MessageSquare },
  { path: '/lambda', label: 'Lambda', icon: FunctionSquare },
  { path: '/dynamodb', label: 'DynamoDB', icon: Database },
  { path: '/s3', label: 'S3', icon: HardDrive },
  {
    path: '/eventbridge/eventbuses',
    label: 'EventBridge (EventBus)',
    icon: Zap,
  },
  {
    path: '/eventbridge/scheduler/groups',
    label: 'EventBridge (Scheduler)',
    icon: Clock3,
  },
  { path: '/settings', label: 'Settings', icon: Settings },
];
