// assets
import { 
  IconKey, 
  IconAlertTriangle, 
  IconServerOff, 
  IconShieldLock, 
  IconTools, 
  IconBug 
} from '@tabler/icons-react';

// constant
const icons = {
  IconKey,
  IconAlertTriangle,
  IconServerOff,
  IconShieldLock,
  IconTools,
  IconBug
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: 'Pages & System',
  caption: 'System Status & Error Pages',
  icon: icons.IconKey,
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Authentication',
      type: 'collapse',
      icon: icons.IconKey,
      children: [
        {
          id: 'login',
          title: 'Login',
          type: 'item',
          url: '/login',
          target: true
        },
        {
          id: 'register',
          title: 'Register',
          type: 'item',
          url: '/register',
          target: true
        }
      ]
    },
    {
      id: 'error-pages',
      title: 'Error & Maintenance',
      type: 'collapse',
      icon: icons.IconAlertTriangle,
      children: [
        {
          id: 'error-404',
          title: '404 - Not Found',
          type: 'item',
          url: '/pages/error/404',
          icon: icons.IconAlertTriangle,
          target: true
        },
        {
          id: 'error-500',
          title: '500 - Server Error',
          type: 'item',
          url: '/pages/error/500',
          icon: icons.IconServerOff,
          target: true
        },
        {
          id: 'error-403',
          title: '403 - Access Denied',
          type: 'item',
          url: '/pages/error/403',
          icon: icons.IconShieldLock,
          target: true
        },
        {
          id: 'system-maintenance',
          title: 'Under Maintenance',
          type: 'item',
          url: '/pages/maintenance',
          icon: icons.IconTools,
          target: true
        }
      ]
    }
  ]
};

export default pages;
