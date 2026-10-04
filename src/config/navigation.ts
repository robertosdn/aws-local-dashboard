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
  { path: '/queues', label: 'Queues', icon: MessageSquare },
  { path: '/s3', label: 'S3', icon: HardDrive, comingSoon: true },
  { path: '/lambda', label: 'Lambda', icon: FunctionSquare },
  { path: '/dynamodb', label: 'DynamoDB', icon: Database, comingSoon: true },
  {
    path: '/eventbridge/eventbus',
    label: 'EventBridge (EventBus)',
    icon: Zap,
    comingSoon: true,
    disabled: true,
  },
  {
    path: '/eventbridge/scheduler',
    label: 'EventBridge (Scheduler)',
    icon: Clock3,
    comingSoon: true,
    disabled: true,
  },
  { path: '/settings', label: 'Settings', icon: Settings },
];
