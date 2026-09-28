import {
  IconSettings,
  IconUserCheck,
  IconShieldLock,
  IconBellRinging,
  IconListDetails,
  IconAward
} from '@tabler/icons-react';

// constant
const icons = {
  IconSettings,
  IconUserCheck,
  IconShieldLock,
  IconBellRinging,
  IconListDetails,
  IconAward
};

// ==============================|| SYSTEM MENU ITEMS ||============================== //

const system = {
  id: 'system',
  title: 'System Preferences',
  type: 'group',
  children: [
    {
      id: 'settings',
      title: 'Account Settings',
      type: 'collapse',
      icon: icons.IconSettings,
      children: [
        {
          id: 'profile-settings',
          title: 'Vendor Profile & Details',
          type: 'item',
          url: '/system/settings/profile',
          icon: icons.IconUserCheck,
          breadcrumbs: true
        },
        {
          id: 'security-2fa-settings',
          title: '2-Step Security & Password',
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
          title: 'Subscription & Membership Plan',
          type: 'item',
          url: '/system/settings/subscription',
          icon: icons.IconAward,
          breadcrumbs: true
        }
      ]
    },
    {
      id: 'policies',
      title: 'Policies & Legal',
      type: 'collapse',
      icon: icons.IconListDetails,
      children: [
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          type: 'item',
          url: '/privacy-policy',
          breadcrumbs: true
        },
        {
          id: 'terms-conditions',
          title: 'Terms of Service',
          type: 'item',
          url: '/terms-of-service',
          breadcrumbs: true
        },
        {
          id: 'vendor-agreements',
          title: 'Vendor Partner Policies (Admin)',
          type: 'item',
          url: '/vendor-policies',
          breadcrumbs: true
        },
        {
          id: 'customer-policies-studio',
          title: 'Customer Policy Management',
          type: 'item',
          url: '/platform/policies',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default system;
