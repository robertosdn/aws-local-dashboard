import { createElement, type ReactNode } from 'react';
import DashboardPage from '@/pages/DashboardPage';
import QueuesPage from '@/pages/QueuesPage';
import SettingsPage from '@/pages/SettingsPage';
import S3Page from '@/pages/S3Page';
import LambdaPage from '@/pages/LambdaPage';
import LambdaDetailPage from '@/pages/LambdaDetailPage';
import DynamoDbPage from '@/pages/DynamoDbPage';
import EventBusesPage from '@/pages/EventBusesPage';
import EventBusDetailPage from '@/pages/EventBusDetailPage';
import SchedulerGroupsPage from '@/pages/SchedulerGroupsPage';
import SchedulerGroupDetailPage from '@/pages/SchedulerGroupDetailPage';
import SchedulerSchedulesPage from '@/pages/SchedulerSchedulesPage';
import SchedulerScheduleDetailPage from '@/pages/SchedulerScheduleDetailPage';

export type AppRoute = {
  path: string;
  label: string;
  element: ReactNode;
};

export const routes: AppRoute[] = [
  {
    path: '/',
    label: 'Dashboard',
    element: createElement(DashboardPage),
  },
  {
    path: '/queues',
    label: 'Queues',
    element: createElement(QueuesPage),
  },
  {
    path: '/s3',
    label: 'S3',
    element: createElement(S3Page),
  },
  {
    path: '/lambda',
    label: 'Lambda',
    element: createElement(LambdaPage),
  },
  {
    path: '/lambda/:functionName',
    label: 'Lambda Detail',
    element: createElement(LambdaDetailPage),
  },
  {
    path: '/dynamodb',
    label: 'DynamoDB',
    element: createElement(DynamoDbPage),
  },
  {
    path: '/eventbridge/eventbuses',
    label: 'Event Buses',
    element: createElement(EventBusesPage),
  },
  {
    path: '/eventbridge/eventbuses/:name',
    label: 'Event Bus Detail',
    element: createElement(EventBusDetailPage),
  },
  {
    path: '/eventbridge/scheduler/groups',
    label: 'Schedule Groups',
    element: createElement(SchedulerGroupsPage),
  },
  {
    path: '/eventbridge/scheduler/groups/:groupName',
    label: 'Schedule Group Detail',
    element: createElement(SchedulerGroupDetailPage),
  },
  {
    path: '/eventbridge/scheduler/groups/:groupName/schedules',
    label: 'Schedules',
    element: createElement(SchedulerSchedulesPage),
  },
  {
    path: '/eventbridge/scheduler/groups/:groupName/schedules/:scheduleName',
    label: 'Schedule Detail',
    element: createElement(SchedulerScheduleDetailPage),
  },
  {
    path: '/settings',
    label: 'Settings',
    element: createElement(SettingsPage),
  },
];
