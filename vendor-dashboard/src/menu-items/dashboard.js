// assets
import { IconDashboard, IconDeviceAnalytics, IconReceipt } from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconDeviceAnalytics, IconReceipt };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
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
      id: 'analytics',
      title: 'Business Analytics',
      type: 'item',
      url: '/analytics',
      icon: icons.IconDeviceAnalytics,
      breadcrumbs: true
    },
    {
      id: 'reports',
      title: 'Account Reports',
      type: 'item',
      url: '/reports',
      icon: icons.IconReceipt,
      breadcrumbs: true
    }
  ]
};

export default dashboard;
