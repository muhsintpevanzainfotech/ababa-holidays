import { IconDashboard, IconCalendarEvent } from '@tabler/icons-react';

const icons = { IconDashboard, IconCalendarEvent };

const dashboard = {
  id: 'dashboard-group',
  title: 'OVERVIEW',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'General Overview',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: true
    },
    {
      id: 'calendar',
      title: 'Calendar & Schedule',
      type: 'item',
      url: '/calendar',
      icon: icons.IconCalendarEvent,
      breadcrumbs: true
    }
  ]
};

export default dashboard;
