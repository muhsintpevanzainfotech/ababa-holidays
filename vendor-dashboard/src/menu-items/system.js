import {
  IconSettings,
  IconUserCheck,
  IconShieldLock,
  IconBellRinging,
  IconAward,
  IconKey
} from '@tabler/icons-react';

const icons = {
  IconSettings,
  IconUserCheck,
  IconShieldLock,
  IconBellRinging,
  IconAward,
  IconKey
};

const system = {
  id: 'system-group',
  title: 'SYSTEM & SETTINGS',
  type: 'group',
  children: [
    {
      id: 'profile-settings',
      title: 'Vendor Profile Details',
      type: 'item',
      url: '/system/settings/profile',
      icon: icons.IconUserCheck,
      breadcrumbs: true
    },
    {
      id: 'security-settings',
      title: 'Security & Password',
      type: 'item',
      url: '/system/settings/security',
      icon: icons.IconShieldLock,
      breadcrumbs: true
    },
    {
      id: 'notifications-settings',
      title: 'Notifications & Alerts',
      type: 'item',
      url: '/system/settings/notifications',
      icon: icons.IconBellRinging,
      breadcrumbs: true
    },
    {
      id: 'subscription-settings',
      title: 'Subscription Plan',
      type: 'item',
      url: '/system/settings/subscription',
      icon: icons.IconAward,
      breadcrumbs: true
    },
    {
      id: 'api-documentation',
      title: 'API & Integration Docs 🔑',
      type: 'item',
      url: '/platform/api-docs',
      icon: icons.IconKey,
      breadcrumbs: true
    }
  ]
};

export default system;
